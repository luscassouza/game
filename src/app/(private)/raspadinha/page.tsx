"use client"

import { Suspense } from "react"
import RaspadinhaContent from "./components/raspadinhaClient"

export default function Raspadinha() {

    return <>
        <Suspense>
            <RaspadinhaContent />
        </Suspense>
    </>
}