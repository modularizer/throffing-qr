import qrcode from "qrcode-generator"

function getPath(params) {
    const p = params.path
    return Array.isArray(p) ? p.join("/") : (p || "")
}

function stripExt(path) {
    if (path.endsWith(".svg")) return [path.slice(0, -4), "svg"]
    if (path.endsWith(".png")) return [path.slice(0, -4), "png"]
    return [path, null]
}

function normalize(raw) {
    let text = decodeURIComponent(raw).trim()
    if (!/^https?:\/\//i.test(text)) text = "https://" + text
    return text
}

function makeSvg(text, options = {}) {
    const qr = qrcode(0, "M")
    qr.addData(text)
    qr.make()

    const darkColor = options.dark || "#000000"
    const lightColor = options.light || "#FFFFFF"
    const margin = options.margin || 1
    const shadow = options.shadow === "true" || options.shadow === true

    let svg = qr.createSvgTag({
        scalable: true,
        margin: margin
    })

    // Replace colors first
    svg = svg.replace(/fill="black"/g, `fill="${darkColor}"`)
    svg = svg.replace(/fill="white"/g, `fill="${lightColor}"`)
    svg = svg.replace(/fill='black'/g, `fill='${darkColor}'`)
    svg = svg.replace(/fill='white'/g, `fill='${lightColor}'`)
    svg = svg.replace(/#000000/g, darkColor)
    svg = svg.replace(/#FFFFFF/g, lightColor)
    svg = svg.replace(/#ffffff/gi, lightColor)

    // Match the client preview: shadow the whole QR image box, not individual modules.
    if (shadow) {
        const parts = svg.match(/^(<svg[^>]*viewBox="([^"]+)"[^>]*>)(<rect[^>]*\/>)((?:<path[^>]*\/>)?)<\/svg>$/)
        if (parts) {
            const [, openSvg, viewBox, rect, path = ""] = parts
            const [, , width, height] = viewBox.split(/\s+/).map(Number)
            const padding = 4
            const shadowFilter = '<defs><filter id="qr-shadow" x="-20%" y="-20%" width="160%" height="160%" color-interpolation-filters="sRGB"><feGaussianBlur in="SourceAlpha" stdDeviation="1.6" result="blur"/><feOffset in="blur" dx="1.5" dy="2" result="offset"/><feFlood flood-color="#000000" flood-opacity="0.18" result="shadow-color"/><feComposite in="shadow-color" in2="offset" operator="in" result="shadow"/><feMerge><feMergeNode in="shadow"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>'
            const paddedSvg = openSvg.replace(
                /viewBox="[^"]+"/,
                `viewBox="0 0 ${width + padding * 2} ${height + padding * 2}"`
            )
            const sizedRect = rect
                .replace('width="100%"', `width="${width}"`)
                .replace('height="100%"', `height="${height}"`)
            svg = `${paddedSvg}${shadowFilter}<g filter="url(#qr-shadow)" transform="translate(${padding} ${padding})">${sizedRect}${path}</g></svg>`
        }
    }

    return svg
}

export async function onRequestGet(context) {
    try {
        const path = getPath(context.params)
        const [raw, ext] = stripExt(path)

        // Extract query parameters
        const url = new URL(context.request.url)
        const queryParams = {
            dark: url.searchParams.get("dark") ? "#" + url.searchParams.get("dark") : "#000000",
            light: url.searchParams.get("light") ? "#" + url.searchParams.get("light") : "#FFFFFF",
            margin: parseInt(url.searchParams.get("margin") || "1"),
            size: parseInt(url.searchParams.get("size") || "280"),
            shadow: url.searchParams.get("shadow")
        }

        // /google.com.svg -> QR image
        if (ext === "svg") {
            const svg = makeSvg(normalize(raw), queryParams)

            return new Response(svg, {
                headers: {
                    "content-type": "image/svg+xml; charset=utf-8",
                    "cache-control": "public, max-age=31536000, immutable"
                }
            })
        }

        // PNG not supported by this pure edge-safe lib
        if (ext === "png") {
            return new Response("PNG not supported yet; use .svg", { status: 501 })
        }

        // /google.com -> serve index.html
        const indexRequest = new Request(new URL("/index.html", context.request.url))
        return context.env.ASSETS.fetch(indexRequest)
    } catch (err) {
        return new Response(String(err?.stack || err), {
            status: 500,
            headers: { "content-type": "text/plain" }
        })
    }
}