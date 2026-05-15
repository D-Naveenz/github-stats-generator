import type { ProfileStats } from './github/service.js'

export type Rank = {
    level: string
    percentile: number
}

function exponentialCdf(value: number): number {
    return 1 - 2 ** -value
}

function logNormalCdf(value: number): number {
    return value / (1 + value)
}

export function calculateRank(stats: ProfileStats): Rank {
    const commitsMedian = 250
    const prsMedian = 50
    const issuesMedian = 25
    const reviewsMedian = 2
    const starsMedian = 50
    const followersMedian = 10

    const commitsWeight = 2
    const prsWeight = 3
    const issuesWeight = 1
    const reviewsWeight = 1
    const starsWeight = 4
    const followersWeight = 1
    const totalWeight =
        commitsWeight +
        prsWeight +
        issuesWeight +
        reviewsWeight +
        starsWeight +
        followersWeight

    const rank =
        1 -
        (commitsWeight * exponentialCdf(stats.totalCommits / commitsMedian) +
            prsWeight * exponentialCdf(stats.pullRequests / prsMedian) +
            issuesWeight * exponentialCdf(stats.issues / issuesMedian) +
            reviewsWeight * exponentialCdf(0 / reviewsMedian) +
            starsWeight * logNormalCdf(stats.totalStars / starsMedian) +
            followersWeight * logNormalCdf(stats.followers / followersMedian)) /
            totalWeight

    const percentile = rank * 100
    const thresholds = [1, 12.5, 25, 37.5, 50, 62.5, 75, 87.5, 100]
    const levels = ['S', 'A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C']
    const level = levels[thresholds.findIndex((value) => percentile <= value)]

    return {
        level: level ?? 'C',
        percentile,
    }
}
