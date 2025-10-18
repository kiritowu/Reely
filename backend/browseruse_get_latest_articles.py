import asyncio
from pydantic_ai import Agent, ModelSettings
from pydantic_ai.exceptions import ModelHTTPError
from pydantic_ai.mcp import MCPServerStdio
from pydantic import BaseModel
from dotenv import load_dotenv
from lib import read_yaml, verify_url_exists
from fastapi.responses import JSONResponse
import time
from browser_use import Tools

load_dotenv(override=True)

prompts = read_yaml("prompts.yaml")
tools = Tools()

# URL = "https://semianalysis.com/"
URL = "https://newsletter.semianalysis.com/p/inferencemax-open-source-inference"
NUM_ARTICLES = 5
MAX_SUMMARY_LENGTH = 5


GOOGLE_MODEL_NAME = "gemini-2.5-flash-lite"
ANTHROPIC_MODEL_NAME = "anthropic:claude-sonnet-4-0"
OPENAI_MODEL_NAME = "gpt-5-nano"

MODEL_NAMES = {"search": GOOGLE_MODEL_NAME, "summarizer": GOOGLE_MODEL_NAME}


class UrlExtractResult(BaseModel, use_attribute_docstrings=True):
    urls: list[str]
    """List of URLs"""
    title: list[str]
    """List of article titles"""


class SummarizationResult(BaseModel, use_attribute_docstrings=True):
    summary: str
    f"""Summary in a maximum of {MAX_SUMMARY_LENGTH} sentences"""


browser_use_server = MCPServerStdio("uvx", args=["browser-use[cli]", "--mcp"], timeout=10)
url_finder_agent = Agent(
    model=MODEL_NAMES["search"],
    system_prompt=prompts["search_agent_prompt"].format(num_articles=NUM_ARTICLES),
    toolsets=[browser_use_server],
    output_type=UrlExtractResult,
    model_settings=ModelSettings(temperature=0.1),
)


# todo: Try browser_use url seeding
# todo: Try Groq internet model


async def get_latest_articles(website: str) -> list[str] | None:
    try:
        async with url_finder_agent:
            result = await url_finder_agent.run(f"Website: {website}")
    except ModelHTTPError as err:
        print(err)
        return None

    urls = result.output.urls
    if len(urls):
        return list(filter(verify_url_exists, urls))

    return None


async def summarize(url: str):
    article_summarizer_agent = Agent(
        model=MODEL_NAMES["summarizer"],
        system_prompt=prompts["summarizer_agent_prompt"].format(MAX_SUMMARY_LENGTH=MAX_SUMMARY_LENGTH),
        toolsets=[browser_use_server],
        output_type=SummarizationResult,
    )

    async with article_summarizer_agent:
        result = await article_summarizer_agent.run(f"Website: {url}")
    return result.output.summary if result.output.summary else "Could not retrieve summary"


async def concurrent_summary(urls: list[str], concurrency: int = 10) -> dict[str, str]:
    sem = asyncio.Semaphore(concurrency)

    async def _worker(u: str):
        async with sem:
            return await summarize(u)

    tasks = [_worker(u) for u in urls]
    summaries = await asyncio.gather(*tasks, return_exceptions=False)
    return dict(zip(urls, summaries))


async def latest_articles_and_summarize():
    # start = time.perf_counter()
    # latest_urls = await get_latest_articles("https://blog.samaltman.com/")
    # print(f"Retrieved latest articles in {time.perf_counter() - start}")
    latest_urls = ["https://blog.samaltman.com/sora-update-number-1", "https://blog.samaltman.com/sora-2"]
    if latest_urls:
        print(f"Summarizing the following articles: {latest_urls}")
        result = await concurrent_summary(latest_urls[:2])
        return result

    return None

    # if len(result):
    #     result = await summarize("https://newsletter.semianalysis.com/p/inferencemax-open-source-inference")


if __name__ == "__main__":
    start = time.perf_counter()
    latest_urls = asyncio.run(latest_articles_and_summarize())
    print(latest_urls)
    print(time.perf_counter() - start)
