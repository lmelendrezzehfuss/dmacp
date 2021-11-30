<script>
import * as d3 from 'd3';
import { onMount } from 'svelte';
import Curves from './Curves.svelte';


    export let data;

    let width;
    let height;
    let xScale = () => {};
    let xTicks = [];
    let yScale = () => {};
    let scaledEntities = [];
    let scaledIntervals = [];

    // Come up with a temporal scale that maps to pixels and then remap for log? See: https://stackoverflow.com/questions/30672392/logarithmic-time-scale
    const xValues = data.map(essay => essay.map(narration => narration.entityTimePosition.map( entity => entity.x ))).flat(2)
    const yValues = data.map(essay => essay.map(narration => narration.entityTimePosition.map( entity => entity.y ))).flat(2)
    // const narrationValues = data.map((essay , e) => e)
    onMount(async () => {
        width = document.getElementById("container").clientWidth
        height = document.getElementById("container").clientHeight

        let xScale_ = d3.scaleSymlog().domain(d3.extent(xValues.map(d => { return d}))).constant(1).range([100, 1.33*width]).clamp(false).nice()
        yScale = d3.scaleLinear().domain(d3.extent(yValues.map(d => { return d }))).range([30, height - 30])

        // overwrite scale function and shift cener to 1945
        xScale = (x) => xScale_(x-1945) 
        xTicks = xScale_.ticks(5)

        scaledEntities = data.map((essay, e) => {
        return essay.map((narration) => {
            // console.log(narration)
            return narration.entityTimePosition.map( (entity) => {
                return {
                        narration: e,
                        id: narration.resource,
                        textualLabel: entity.label,
                        cx: xScale(entity.x),
                        cy: yScale(entity.y),
                        type: narration.type,
                        context: narration.intervalContext,
                        targets: narration.targets
                    }
                } )
            })
        }).flat(2)   
        
        scaledIntervals = data.map((essay, e) => {
        return essay.map((narration) => {
            let x1 = 0;
            let x2 = 0;
            const entityLength = narration.entityTimePosition.length
            if (entityLength > 0) {
                x1 = xScale(narration.entityTimePosition[0].x)
                x2 = entityLength < 2 ? xScale(d3.max(xTicks.map(d => { return d }))) : xScale(narration.entityTimePosition[entityLength - 1].x)
            }

            return narration.entityTimePosition.map( (entity) => {
                const definitionOfInterval = x2 === xScale(d3.max(xTicks.map(d => { return d }))) ? 'indefinite' : 'finite'
                const y = yScale(entity.y);
                return {
                        narration: e,
                        x1,
                        x2,
                        y1: y,
                        type: narration.type,
                        indefinite: definitionOfInterval,
                        context: narration.intervalContext
                    }
                }).filter(entity => entity.type === 'interval')
            })
        }).flat(2)

    })

</script>
<div>
    <div id="container">
        <svg width="{ width }" height="{ height }">
            <defs>
                <linearGradient id="begin-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style="stop-color:#d8d8d8;stop-opacity:1"/>
                    <stop offset="50%" style="stop-color:rgb(255,255,255);stop-opacity:0" />
                </linearGradient>
                <linearGradient id="end-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="100%" style="stop-color:#d8d8d8;stop-opacity:1"/>
                    <stop offset="50%" style="stop-color:rgb(255,255,255);stop-opacity:0" />
                </linearGradient>
            </defs>
            <g>
                <g transform="translate({ xScale(2021) }, 0)" class="now-tick">
                    <line x1="0" x2="0" y1="0" y2="{ height }" stroke="black"/>
                    <text x="5" y="15">Now</text>
                </g>
                {#each xTicks as tick}
                    <g transform="translate({ xScale(tick) }, 0)" class="tick">
                        <text x="880" y="-5" transform="rotate(90)" text-anchor="end">{ tick }</text>
                        <line x1="0" x2="0" y1="0" y2="{ height }" stroke="black"/>
                    </g>
                {:else}
                 <!-- svelte-ignore empty-block -->
                {/each}
            </g>
            {#each scaledIntervals as value}
                {#if value.indefinite === 'indefinite' }
                    <rect x="{ value.x1 }" width="{ value.x2 }" y="{ value.y1 - 1 }" height="2" class="{ value.context }"/>
                {:else}
                    <line x1="{ value.x1 }" x2="{ value.x2 }" y1="{ value.y1 }" y2="{ value.y1 }" class="{ value.indefinite }"/>
                {/if}
            {:else}
                <text>loading</text>
            {/each}
            {#if scaledEntities.length !== 0}
                <Curves scaledEntities='{scaledEntities}'/>
            {/if}
            {#each scaledEntities as value}
            <g class="entity">
                <circle cx="{ value.cx }" cy="{ value.cy }" r="2"/>
                <g transform="translate(10, 0)" class="label">
                    <text x="{ value.cx }" y="{ value.cy }">{ value.textualLabel }</text>
                </g>
            </g>
            {:else}
                <text>loading</text>
            {/each}
        </svg>
    </div>
</div>
<style>

    #container {
        height: 92vh;
        /* width: 80vw; */
    }

    svg {
        /* width: 100%; */
        border: 1px solid black;
    }

    g.tick > line {
        stroke-dasharray: 1 3;
    }

    .now-tick {
        fill: red;
    }

    .tick text {
        font-size: 8px;
    }

    svg circle {
        fill: white;
        stroke: black;
    }

    .label {
        opacity: 0;
    }

    .entity:hover > .label {
        opacity: 1;
    }

    .entity:hover circle {
        fill: rgb(29, 29, 29);
    }

    .is-end {
        fill: url(#end-grad);
        transform: translate(-100%, 0)
    }

    .is-beginning {
        fill: url(#begin-grad);
    }

    .finite {
        stroke: rgb(128, 128, 128);
        stroke-width: 2;
    }

    svg text {
        font-size: 10px;
    }

</style>