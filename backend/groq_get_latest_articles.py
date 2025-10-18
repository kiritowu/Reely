import time
from groq import AsyncGroq, Groq
from dotenv import load_dotenv
from lib import read_yaml, verify_url_exists
from pydantic_ai import Agent
import asyncio
from pathlib import Path

load_dotenv(override=True)

prompt_file = str(Path(__file__).resolve().parent / "prompts.yaml")
prompts = read_yaml(prompt_file)

formatter_agent = Agent(
    "openai:gpt-5-nano",
    output_type=list[str],
    system_prompt="You will extract the URLs from the given string and add them to a list. The URLs must be well formatted",
)

client = AsyncGroq(default_headers={"Groq-Model-Version": "latest"})

# website = "https://huyenchip.com/blog/"
website = "https://press.airstreet.com/"


# Returns a list of URLs. It is not formatted in a list, just raw strings...
async def get_latest_articles(num_articles, website) -> str | None:
    chat_completion = await client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": prompts["search_agent_groq"].format(num_articles=num_articles, website=website),
            },
            {"role": "user", "content": "begin"},
        ],
        model="groq/compound",
        temperature=0.1,
    )

    message = chat_completion.choices[0].message

    # Print the final content
    return message.content if message.content else None


# Use another small LLM to format the results into an actual list of urls
async def format_and_verify_urls(result):
    async with formatter_agent:
        formatted_urls_resp = await formatter_agent.run(f"The URLs are: {result}")

    formatted_urls = formatted_urls_resp.output
    formatted_urls = list(filter(verify_url_exists, formatted_urls))
    return formatted_urls


async def get_latest_articles_groq(num_articles, website) -> list[str] | None:
    result = await get_latest_articles(num_articles=num_articles, website=website)

    if result:
        urls = await format_and_verify_urls(result)
        return urls

    return None


if __name__ == "__main__":
    start = time.perf_counter()
    result = asyncio.run(get_latest_articles_groq(5, website))
    print(result)
    print(time.perf_counter() - start)
