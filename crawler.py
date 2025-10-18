# Deep crawling example: Explore a website dynamically
import asyncio
from crawl4ai import AsyncWebCrawler, CrawlerRunConfig
from crawl4ai.deep_crawling import BFSDeepCrawlStrategy

urls = ["https://www.cnbc.com/world/?region=world", "https://stratechery.com/", "https://semianalysis.com/"]


async def deep_crawl_example():
    # Configure a 2-level deep crawl
    config = CrawlerRunConfig(
        deep_crawl_strategy=BFSDeepCrawlStrategy(
            max_depth=2,  # Crawl 2 levels deep
            include_external=False,  # Stay within domain
            max_pages=50,  # Limit for efficiency
        ),
        verbose=True,
    )

    async with AsyncWebCrawler() as crawler:
        # Start crawling and follow links dynamically
        results = await crawler.arun(urls[0], config=config)

        print(f"Discovered and crawled {len(results)} pages")
        for result in results[:3]:
            print(f"Found: {result.url} at depth {result.metadata.get('depth', 0)}")


asyncio.run(deep_crawl_example())
