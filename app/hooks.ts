"use client"
import { INIT_LIST, INIT_TAGS } from "./constants";
import { useState, useEffect, useMemo } from "react";


// Hooks to simulate request data
// Possibly get data from persistence

export const useRequestTags = () => {
    return useMemo(() => INIT_TAGS, []);
};


export const useRequestList = () => {
    return useMemo(() => INIT_LIST, []);
};