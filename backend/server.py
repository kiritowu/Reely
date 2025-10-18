from datetime import datetime
import json
from fastapi import FastAPI, Query
from fastapi.responses import JSONResponse
from browseruse_get_latest_articles import get_latest_articles_and_summarize
import uvicorn


app = FastAPI()


mock_data = {
    "https://blog.samaltman.com/sora-update-number-1": "Sam Altman announced the launch of Sora, an app featuring Sora 2 AI for video creation, sharing, and viewing, designed to foster creativity and new social dynamics. The app includes features like a cameo option for consistent character appearances in videos. While acknowledging risks such as addiction and misuse of likeness, the team has implemented safeguards to mitigate these issues. Sora is guided by principles of long-term user satisfaction, user control, and participation, with ongoing adjustments based on user impact and wellbeing monitoring. The goal is to empower users to quickly translate ideas into videos and achieve their creative aspirations.",
    "https://blog.samaltman.com/sora-2": "The article announces the launch of a new app called Sora, featuring the Sora 2 model, designed to simplify the creation, sharing, and viewing of videos. It highlights the potential for a creative explosion through this technology, with features like the cameo option that allows users to insert themselves and friends into videos, enhancing social connection. The team acknowledges concerns about potential negative effects, such as addiction and misuse for bullying or deepfakes, and has implemented safeguards and content moderation to address these risks. The article outlines key principles guiding Sora’s development, including optimizing for long-term user satisfaction, encouraging user control over their feed, prioritizing creation, and helping users achieve their long-term goals. The team plans to continue experimenting with different approaches to maintain a positive user experience and is committed to making significant changes or discontinuing the service if it does not improve users' lives over time.",
}


@app.get("/latest")
async def latest_articles(
    url: str = Query(..., description="Website to look for articles"),
):
    print(f"Working on: {url}")
    result: dict[str, str] | None = await get_latest_articles_and_summarize(url, num_articles=3)
    if result:
        result["status"] = "success"
        now = datetime.now()
        # Format it as a string
        formatted_now = now.strftime("%Y-%m-%d_%H:%M:%S")
        with open(f"summaries/{url.replace("/", "-")}_{formatted_now}.json", "w") as f:
            json.dump(result, f)

    # If result is None, it failed
    else:
        result = {}
        result["status"] = "failed"
    return JSONResponse(content=result)


# @app.get("/summarize")
# async def summarize_endpoint(
#     url: str = Query(..., description="Input string to summarize"),
#     point_form: bool = Query(False, description="Return summary in point form"),
# ):
#     # logging.info(f"Point form: {point_form}")
#     summary = await _scrape_and_filter_webpage(url, point_form=point_form)
#     return JSONResponse(content={"summary": summary})


if __name__ == "__main__":
    uvicorn.run("server:app", host="127.0.0.1", port=3000)
