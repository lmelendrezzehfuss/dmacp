import * as d3 from 'd3';

export default async function loadData(dataPath) {
    const data = await d3.html(dataPath).then(function (essay) {
        console.log(essay)
        let globalY = 0
        essay = [].map.call(essay.querySelectorAll("p"), (narration, n) => {
            // First layer: I am looping over separate paragraphs within the essay. Each paragraph contains many or no entities.
            // console.log('looping over narration', n)

            narration = [].map.call(narration.querySelectorAll('[typeof][resource]'), (entity, e) => {
                // This is one single entity. I am creating an array with its properties so it becomes iterable
                // console.log('entity', e, entity.getAttribute('resource'), entity.getAttribute('typeof'))
                const entityTimePosition = []
                const isInstant = entity.getAttribute('typeof') === 'time:ProperInterval' ? false : true
                const arrayOfProperties = Array.from(entity.querySelectorAll('meta'))
                const arrayofParentEntities = Array.from(entity.querySelectorAll('span'))

                let intervalPointsCount = 0
                let singleEntity = {}
                let connections = []
                let intervalContext = null

                globalY = globalY + 1

                arrayOfProperties.forEach((unit, u) => {
                    const followingElement = arrayOfProperties[u + 1]
                    let label = u + 1 < arrayOfProperties.length ? followingElement.getAttribute('content') : null

                    const hasYear = unit.getAttribute('property') === 'time:inXSDgYear'
                    const hasConnection = unit.getAttribute('property') === 'ac:hasConnection'
                    const hasIndefinetness = unit.getAttribute('property') === 'ac:hasIndefiniteness'

                    // Assign position to element if present
                    if (hasYear & intervalPointsCount === 0) {
                        singleEntity.x = +unit.getAttribute('content')
                        singleEntity.y = globalY
                        singleEntity.label = label

                        intervalPointsCount = intervalPointsCount + 1

                    } else if (hasYear & intervalPointsCount > 0) {
                        // If more than one meta property has time pushes an additional object with essential data
                        entityTimePosition.push({
                            x: +unit.getAttribute('content'),
                            y: globalY,
                            label
                        })
                    }

                    // Assign connection(s) to parent if present
                    if (hasConnection) {
                        singleEntity.target = unit.getAttribute('resource').substring(1)
                        const connection = unit.getAttribute('resource').substring(1)
                        connections.push(connection)
                    }

                    // Assign indefineteness to element if present
                    if (hasIndefinetness) {
                        singleEntity.indefinitness = +unit.getAttribute('content')
                    }

                })

                entityTimePosition.push(singleEntity)

                // Separate loop to determine whether one of the interval's end is undefined.
                arrayofParentEntities.forEach((ent) => {
                    if (ent.hasAttributes()) {
                        const hasEnd = ent.getAttribute('property') === 'time:hasEnd'
                        const hasBeginning = ent.getAttribute('property') === 'time:hasBeginning'

                        if (!isInstant & arrayofParentEntities.length === 1) {
                            if (hasBeginning & !hasEnd) {
                                intervalContext = 'is-beginning'
                            } else if (!hasBeginning & hasEnd) {
                                intervalContext = 'is-end'
                            }
                        }
                    }
                })


                return {
                    resource: entity.getAttribute('resource').substring(1),
                    type: isInstant ? 'instant' : 'interval',
                    targets: connections,
                    entityTimePosition: entityTimePosition.filter(d => { return d.label !== undefined }),
                    intervalContext
                }
            })
            return narration
        })
        return essay
    });
    console.log('data', data)
    return data
};
