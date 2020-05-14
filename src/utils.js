
export function HSVtoRGB(h, s, v) {
    var r, g, b, i, f, p, q, t;
    if (arguments.length === 1) {
        s = h.s, v = h.v, h = h.h;
    }
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return [
        r,g,b
    ];
}


function isPowerOf2(value) {
    return (value & (value - 1)) == 0;
}

export function generateUID(){
    let text = '';
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 15; i++){
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    localStorage.setItem('UID', text);
    return text;
}

export function createOverlay(){
    const container = document.createElement('div');
    container.classList.add("overlay");

    const text = document.createElement('P');
    text.innerHTML = `<h2>Getting to Know WebGL</h2>
                      <br>Generating icospheres and disturbing the vertices with Perlin noise.
                      <br><br>Mouse + WASD - Move
                      <br>Scroll - Change FOV`;
    container.appendChild(text);

    const code = document.createElement('a');
    code.text = "Code";
    code.href = "https://github.com/joshmurr/webgl_environment_test";

    container.appendChild(code);

    const body = document.getElementsByTagName("body")[0];
    body.appendChild(container);
}
