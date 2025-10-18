'use client'

import Link from 'next/link'
import { Video } from 'lucide-react'
import './watch-feed-button.css'

export function WatchFeedButton() {
  return (
    <Link href="/app" className="fancy-button">
      <span className="fold"></span>

      <div className="points-wrapper">
        <i className="point"></i>
        <i className="point"></i>
        <i className="point"></i>
        <i className="point"></i>
        <i className="point"></i>
        <i className="point"></i>
        <i className="point"></i>
        <i className="point"></i>
        <i className="point"></i>
        <i className="point"></i>
      </div>

      <span className="inner">
        <Video className="icon" strokeWidth={2} />
        Watch Feed
      </span>
    </Link>
  )
}

