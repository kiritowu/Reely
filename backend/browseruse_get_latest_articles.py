import asyncio
import os
from pydantic_ai import Agent, ModelSettings, UsageLimits
from pydantic_ai.exceptions import ModelHTTPError
from pydantic_ai.mcp import MCPServerStdio
from pydantic import BaseModel
from dotenv import load_dotenv
from lib import read_yaml, verify_url_exists
from fastapi.responses import JSONResponse
import time
from browser_use import Tools, Browser, ChatGoogle, ChatAnthropic, ChatBrowserUse
from browser_use import Agent as BrowserUseAgent
from pathlib import Path

load_dotenv(override=True)

prompt_file = str(Path(__file__).resolve().parent / "prompts.yaml")
prompts = read_yaml(prompt_file)
browser_use_tools = Tools()

# URL = "https://semianalysis.com/"
URL = "https://newsletter.semianalysis.com/p/inferencemax-open-source-inference"
NUM_ARTICLES = 5  # Number of most recent articles to return
MAX_SUMMARY_LENGTH = 4  # Max no. of sentences per for summary


GOOGLE_MODEL_NAME = "gemini-2.5-flash-lite"
# ANTHROPIC_MODEL_NAME = "anthropic:claude-sonnet-4-0"
ANTHROPIC_MODEL_NAME = "claude-sonnet-4-0"
OPENAI_MODEL_NAME = "gpt-5-nano"

LATEST_ARTICLE_MODEL = GOOGLE_MODEL_NAME
SUMMARIZE_ARTICLE_LLM = ChatAnthropic(model=ANTHROPIC_MODEL_NAME)


class UrlExtractResult(BaseModel, use_attribute_docstrings=True):
    urls: list[str]
    """URLs for the latest articles"""
    successful: bool
    """Whether summarization was successful"""


class SummarizationResult(BaseModel, use_attribute_docstrings=True):
    summary: str
    """Summary"""
    successful: bool
    """Whether summarization was successful"""


browser_use_server = MCPServerStdio("uvx", args=["browser-use[cli]", "--mcp"], timeout=10)
# browser_use_server = MCPServerStdio(
#     "uvx",
#     args=["mcp-server-browser-use@latest"],
#     env={
#         "MCP_LLM_GOOGLE_API_KEY": os.environ["GOOGLE_API_KEY"],
#         "MCP_LLM_PROVIDER": "google",
#         "MCP_LLM_MODEL_NAME": "gemini-2.5-flash-lite",
#         "MCP_BROWSER_HEADLESS": "false",
#     },
#     timeout=15,
# )

# todo: Try browser_use url seeding
# todo: Try Groq internet model


async def get_latest_articles(website: str, num_articles) -> list[str] | None:
    browser = Browser(
        headless=False,  # Show browser window
    )

    agent = BrowserUseAgent(
        task=prompts["search_agent_prompt"].format(num_articles=num_articles) + f"\nWebsite: {website}",
        browser=browser,
        llm=ChatBrowserUse(),
        use_vision=True,
        output_model_schema=UrlExtractResult,
    )

    result = await agent.run()

    if result.is_done():
        urls = result.structured_output
        # Check if summarization was successful
        if urls.successful:
            return urls.urls


# async def get_latest_articles(website: str, num_articles) -> list[str] | None:
#     url_finder_agent = Agent(
#         model=LATEST_ARTICLE_MODEL,
#         system_prompt=prompts["search_agent_prompt"].format(num_articles=num_articles),
#         toolsets=[browser_use_server],
#         output_type=UrlExtractResult,
#         model_settings=ModelSettings(temperature=0.1),
#     )

#     @url_finder_agent.tool_plain
#     def verify_url(url: str) -> bool:
#         """Verify if a given URL is real"""
#         return verify_url_exists(url)

#     try:
#         async with url_finder_agent.iter(f"Website: {website}") as run:
#             async for node in run:
#                 print(node)
#                 print("\n")
#         result = run.result
#         # async with url_finder_agent:
#         #     result = await url_finder_agent.run(f"Website: {website}", usage_limits=UsageLimits(request_limit=50))
#     except ModelHTTPError as err:
#         print(err)
#         return None

#     urls = result.output.urls

#     # Filter out URLs that don't exist...
#     if len(urls):
#         # Remove the original website URL from the list...
#         urls = list(filter(lambda x: x != website, urls))
#         return list(filter(verify_url_exists, urls))

#     return None


# async def summarize(url: str):
#     article_summarizer_agent = Agent(
#         model=GOOGLE_MODEL_NAME,
#         system_prompt=prompts["summarizer_agent_prompt"].format(max_summary_length=MAX_SUMMARY_LENGTH),
#         toolsets=[browser_use_server],
#         output_type=SummarizationResult,
#     )

#     async with article_summarizer_agent:
#         result = await article_summarizer_agent.run(f"Website: {url}")
#     return result.output.summary if result.output.summary else "Could not retrieve summary"


# async def concurrent_summary(urls: list[str], concurrency: int = 10) -> dict[str, str]:
#     sem = asyncio.Semaphore(concurrency)

#     async def _worker(u: str):
#         async with sem:
#             return await summarize(u)

#     tasks = [_worker(u) for u in urls]
#     summaries = await asyncio.gather(*tasks, return_exceptions=False)
#     return dict(zip(urls, summaries))


async def concurrent_summarize(urls: list[str]) -> dict[str, str]:
    num_urls = len(urls)
    # Create n separate browser instances
    browsers = [
        Browser(
            user_data_dir=f"./temp-profile-{i}",
            headless=False,
        )
        for i in range(num_urls)
    ]

    # Create n agents with different tasks
    agents = [
        BrowserUseAgent(
            task=prompts["summarizer_agent_prompt"].format(max_summary_length=MAX_SUMMARY_LENGTH, article=urls[i]),
            browser=browsers[i],
            # llm=ChatGoogle(model=GOOGLE_MODEL_NAME),
            llm=SUMMARIZE_ARTICLE_LLM,
            output_model_schema=SummarizationResult,
            # use_vision=True,
        )
        for i in range(num_urls)
    ]

    # Run all agents in parallel
    tasks = [agent.run() for agent in agents]
    results = await asyncio.gather(*tasks, return_exceptions=True)

    summaries = {}
    for i, history in enumerate(results):
        # If summarization was completed, add to the summaries dict
        if history.is_done():
            summary: SummarizationResult = SummarizationResult.model_validate_json(history.final_result())
            # Check if summarization was successful
            if summary.successful:
                summaries[urls[i]] = summary.summary

    return summaries


async def get_latest_articles_and_summarize(website, num_articles) -> dict[str, str] | None:
    get_articles_start = time.perf_counter()
    latest_urls = await get_latest_articles(website, num_articles)
    print(latest_urls)
    print(f"Retrieved latest articles in {time.perf_counter() - get_articles_start}")

    if latest_urls:
        print(f"Summarizing the following articles: {latest_urls}")
        get_summaries_start = time.perf_counter()
        result = await concurrent_summarize(latest_urls)
        print(f"Successfully retrieved {len(result)} summaries in {time.perf_counter() - get_summaries_start}")
        return result

    return None


# async def test():
#     start = time.perf_counter()
#     latest_urls = await get_latest_articles("https://stratechery.com/", 2)
#     print(latest_urls)
#     print(time.perf_counter() - start)


if __name__ == "__main__":
    # asyncio.run(test())
    start = time.perf_counter()
    summaries = asyncio.run(get_latest_articles_and_summarize("https://news.ycombinator.com/", NUM_ARTICLES))
    print(summaries)
    print(f"Total time: {time.perf_counter() - start}")
