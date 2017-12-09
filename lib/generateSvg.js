'use strict'

const getHighestNumber = (array) => {
  // flatten array of arrays of numbers into an array of numbers
  const flattened = [].concat.apply([], array)
  // return the highest number
  return Math.max.apply(null, flattened)
}

module.exports = (resultArrays, pms, tests) => {
  let svgStr = ''
  // colors taken from logos (where possible)
  const colors = [ '#cd3731', '#248ebd', '#fbae00' ]
  const offset = 20
  const offsetTop = 30
  const offsetBottom = 18
  // width of bars
  const width = 15
  // spacing between bars
  const spacing = 1
  // spacing between groups of bars
  const separation = 15
  // rectangle in which the graph will be drawn
  const graph = {
    x: offset,
    y: offsetTop,
    w: tests.length * pms.length * (width + spacing) +
      (tests.length - 1) * separation +
      offset,
    h: 100
  }
  const vb = {
    x: 0,
    y: 0,
    w: offset + graph.w,
    h: 100 + offsetTop + offsetBottom
  }
  // get the highest number of the results so
  // that the graph can be scaled accordingly
  const max = getHighestNumber(resultArrays)
  // upper limit of graph is the highest number rounded
  // up to the nearest number divisible by 5
  const limit = Math.ceil(max / 5) * 5
  const ratio = graph.h / limit

  svgStr += '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" '
  svgStr += `viewBox="${vb.x} ${vb.y} ${vb.w} ${vb.h}">` + '\n'

  // uncomment to color the entire view box for debugging
  // svgStr += `<rect x="${vb.x}" y="${vb.y}" width="${vb.w}" height="${vb.h}" fill="${'#eaeaea'}"></rect>` + '\n'

  let circlesY

  // draw legend
  pms.forEach((pm, index) => {
    // draw colored circle
    const radius = 5
    const offsetCircle = (width - radius * 2) / 2
    const x = graph.x + radius + offsetCircle + (width + spacing) * index
    const y = vb.y + radius + offsetCircle
    svgStr += `  <circle cx="${x}" cy="${y}" r="${radius}" fill="${colors[index]}"></circle>` + '\n'

    // add name under circle
    let fontSize = 5
    const fontFamily = 'system-ui'
    const baseline = 'middle'
    const anchor = 'middle'
    let textY = y + radius * 2
    svgStr += `  <text x="${x}" y="${textY}" font-size="${fontSize}" font-family="${fontFamily}" alignment-baseline="${baseline}" text-anchor="${anchor}">${pm}</text>` + '\n'

    circlesY = textY

    // add version under name
    const pmVersion = require(`${pm}/package.json`).version
    const text = `v${pmVersion}`
    fontSize = 4
    textY += 6
    svgStr += `  <text x="${x}" y="${textY}" font-size="${fontSize}" font-family="${fontFamily}" alignment-baseline="${baseline}" text-anchor="${anchor}">${text}</text>` + '\n'
  })

  // add node version
  ;(() => {
    const nodeVersion = process.version
    const text = `using Node.js ${nodeVersion}`
    const color = '#888'
    const fontSize = 5
    const fontFamily = 'system-ui'
    const fontStyle = 'italic'
    const baseline = 'middle'
    const x = graph.x +
      ((width + spacing) * 0) +
      (((width + spacing) * pms.length + separation) * 1)
    const y = circlesY
    svgStr += `  <text x="${x}" y="${y}" font-size="${fontSize}" font-family="${fontFamily}" font-style="${fontStyle}" alignment-baseline="${baseline}" fill="${color}">${text}</text>` + '\n'
  })()

  const graphLines = [
    graph.y + limit * ratio * 0,
    graph.y + limit * ratio * 0.2,
    graph.y + limit * ratio * 0.4,
    graph.y + limit * ratio * 0.6,
    graph.y + limit * ratio * 0.8,
    graph.y + limit * ratio * 1
  ]
  let finalGraphLine = ''

  // draw graph lines
  graphLines.forEach((graphLine, index) => {
    const lastLine = index === graphLines.length - 1
    const color = '#cacaca'
    const strokeWidth = lastLine
      ? 1
      : 0.5
    const line = `  <line x1="${graph.x - offset / 2}" y1="${graphLine}" x2="${graph.w + offset / 2}" y2="${graphLine}" stroke-width="${strokeWidth}" stroke="${color}"></line>` + '\n'
    // add final graph line after the bars are drawn so that it is drawn over the bars
    if (lastLine) {
      finalGraphLine = line
    } else {
      svgStr += line
    }

    // add numbers next to graph line
    const fontSize = 6
    const fontFamily = 'system-ui'
    const baseline = 'middle'
    const anchor = 'end'
    const x = graph.x - offset / 2 - 1
    const y = graphLine
    const number = (limit - limit * (index / (graphLines.length - 1)))
    svgStr += `  <text x="${x}" y="${y}" fill="${color}" font-size="${fontSize}" font-family="${fontFamily}" alignment-baseline="${baseline}" text-anchor="${anchor}">${number}</text>` + '\n'
  })

  // draw results as bars
  resultArrays.forEach((results, indexA) => {
    results.forEach((result, indexR) => {
      const roundedCorners = 1
      const x = graph.x +
        ((width + spacing) * indexR) +
        (((width + spacing) * pms.length + separation) * indexA)
      const height = Math.round(result * ratio) || 1
      const y = graph.y + graph.h - height
      svgStr += `  <rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${colors[indexR]}" rx="${roundedCorners}" ry="${roundedCorners}"></rect>` + '\n'
    })
  })

  // draw bottom graph line over the bars
  svgStr += finalGraphLine

  // under each bar group specify the properties of the test
  tests.forEach((test, indexT) => {
    test.forEach((property, indexP) => {
      const fontSize = 5
      const fontFamily = 'system-ui'
      const baseline = 'hanging'
      const anchor = 'start'
      const ySpacing = 2
      const x = graph.x + spacing + (((width + spacing) * pms.length + separation) * indexT)
      const y = graph.y + graph.h + ySpacing + fontSize * indexP
      svgStr += `  <text x="${x}" y="${y}" font-size="${fontSize}" font-family="${fontFamily}" alignment-baseline="${baseline}" text-anchor="${anchor}">${property}</text>` + '\n'
    })
  })

  svgStr += `</svg>` + '\n'

  return svgStr
}
