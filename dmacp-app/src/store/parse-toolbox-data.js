export default function parseToolboxData(toolboxData) {
    const entities = toolboxData["instants"]
    console.log(toolboxData)
    const parsedEntities = entities.map((d, i) => {
        const pointsOfEntities = []
        const targets = []
        let point = {}
        const entityID = d.id
        let entityType = 'instant'
        point['x'] = d.x
        point['y'] = d.y
        point['label'] = d.name
        // TO DO: discuss implementation in paintbox
        point['innerText'] = d.name
        // in my data this included only first child, reference to targets for 
        // all children and consider removing
        point['target'] = []
        
        pointsOfEntities.push(point)
       
        entities.forEach((el) => {
            if (el.target.includes(entityID) && d.y === el.y) {
                point = {}
                point['x'] = el.x
                point['y'] = el.y
                point['label'] = el.name
                point['innerText'] = el.name
                // in my data this included only first child, reference to targets for 
                // all children and consider removing
                point['target'] = []
                entityType = 'interval'
                pointsOfEntities.push(point)
                console.log(d.name, d.target, el.name, el.target)
            } else {
            }
        })

        d.connections.forEach((c) => { 
            const connection = entities.find(el => {return el.id === c})
            if (connection !== undefined) {
                targets.push(connection.name)
            }
         })

        console.log(d)
        return {
            resource: d.name,
            entityTimePosition: pointsOfEntities,
            type: entityType,
            targets,
            intervalContext: null,
            dataSource: "paintbox"
        }

    })

    console.log(parsedEntities)
    return parsedEntities
}