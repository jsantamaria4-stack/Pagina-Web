/* Hero WebGL: nubes en movimiento, río vivo, ondas con el ratón/clic y parallax de profundidad.
   Si WebGL o la carga de texturas falla (p. ej. abriendo con file://), se mantiene el hero CSS. */
(() => {
  const hero = document.querySelector('.hero'), cv = document.getElementById('gl');
  if (!cv || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const gl = cv.getContext('webgl', { antialias: false, alpha: false });
  if (!gl) return;

  const VS = 'attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;gl_Position=vec4(p,0.,1.);}';
  const FS = `precision highp float;varying vec2 v;
uniform sampler2D T,M;uniform float t,wp,A,ct,on;uniform vec2 ms,cm,par;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
 return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float a=.5,s=0.;for(int i=0;i<5;i++){s+=a*n(p);p=p*2.03+vec2(7.1,3.7);a*=.5;}return s;}
vec2 map(vec2 s){float ia=1.7778;vec2 k=vec2(1.);if(A>ia)k.y=ia/A;else k.x=A/ia;k*=.93;
 return s*k+(1.-k)*vec2(.62,.5);}
void main(){
 vec2 uv=map(v);
 float depth=smoothstep(.15,1.,1.-uv.y);               // más cerca = más desplazamiento
 uv+=par*(.004+.016*(1.-smoothstep(.0,.6,uv.y)*.0)*depth);
 vec3 m=texture2D(M,uv).rgb; float sky=m.r*(1.-m.g), wat=m.g;
 // --- nubes: flujo del cielo + capas de nube iluminadas ---
 vec2 w=vec2(wp*.05,0.);
 vec2 q=vec2(fbm(uv*vec2(3.,6.)+w*2.),fbm(uv*vec2(3.,6.)+5.2-w));
 uv+=(q-.5)*.04*sky;
 float c1=fbm(uv*vec2(2.6,7.)+vec2(-wp*.12,0.)+q*.8);
 float c2=fbm(uv*vec2(5.,11.)+vec2(-wp*.20,3.)+q);
 float cl=smoothstep(.36,.72,c1)*.9+smoothstep(.45,.8,c2)*.6;
 // --- río: corriente, ondulación, ondas de ratón y clic ---
 float flow=n(vec2(uv.x*60.-t*.6,uv.y*420.))+n(vec2(uv.x*140.-t*1.1,uv.y*900.+t*.2));
 vec2 mi=map(ms), ci=map(cm);
 vec2 d1=(uv-mi)*vec2(1.7778,1.), d2=(uv-ci)*vec2(1.7778,1.);
 float r1=length(d1), r2=length(d2)-(t-ct)*.20;
 float rip=sin(r1*170.-t*5.)*exp(-r1*16.)*on + sin(r2*150.)*exp(-abs(r2)*26.)*exp(-(t-ct)*.9);
 vec2 off=vec2((flow-1.)*.0032+rip*.0040, rip*.0016)*wat;
 vec3 col=texture2D(T,uv+off).rgb;
 // nubes cálidas cerca del sol, frías lejos
 float sd=distance(uv,vec2(.80,.71));
 vec3 cc=mix(vec3(.62,.70,.85),vec3(1.,.68,.38),smoothstep(.65,.05,sd));
 col*=1.-cl*sky*.16;
 col+=cc*cl*sky*(.30+.6*smoothstep(.6,.0,sd));
 col+=vec3(1.,.72,.40)*.08*sky*smoothstep(.35,0.,sd)*(.8+.2*sin(t*.8));    // pulso del sol
 // destellos del agua según luminosidad
 float lum=dot(col,vec3(.33));
 float g=pow(n(vec2(uv.x*260.-t*.5,uv.y*1100.+t*.15)),7.)*4.;
 col+=vec3(1.,.8,.55)*g*wat*(.25+lum*1.6)+vec3(1.,.9,.7)*max(rip,0.)*.5*wat*lum;
 gl_FragColor=vec4(col,1.);}`;

  const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return o; };
  const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr);
  if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return;
  gl.useProgram(pr);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = n => gl.getUniformLocation(pr, n);

  const load = (src, unit) => new Promise((ok, no) => {
    const im = new Image(); im.onload = () => {
      try {
        const tx = gl.createTexture(); gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, tx);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, im);
        [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]
          .forEach(([a, b]) => gl.texParameteri(gl.TEXTURE_2D, a, b));
        ok();
      } catch (e) { no(e); }
    }; im.onerror = no; im.src = src;
  });

  Promise.all([load(window.HERO_IMG||'assets/img/hero.jpg', 0), load(window.HERO_MASK||'assets/img/hero-mask.png', 1)]).then(() => {
    gl.uniform1i(U('T'), 0); gl.uniform1i(U('M'), 1);
    const R = Math.min(devicePixelRatio || 1, 1.25);
    const size = () => { cv.width = hero.clientWidth * R; cv.height = hero.clientHeight * R; gl.viewport(0, 0, cv.width, cv.height); gl.uniform1f(U('A'), cv.width / cv.height); };
    size(); addEventListener('resize', size);

    let mx = .5, my = .5, sx = .5, sy = .5, on = 0, onT = 0, wind = 0, ph = 0, ct = -99, cmx = .5, cmy = .5, last = performance.now(), vis = true;
    const toUV = e => { const r = hero.getBoundingClientRect(); return [(e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height]; };
    hero.addEventListener('pointermove', e => { [mx, my] = toUV(e); onT = 1; });
    hero.addEventListener('pointerleave', () => { onT = 0; mx = my = .5; });
    hero.addEventListener('pointerdown', e => { [cmx, cmy] = toUV(e); ct = (performance.now() - t0) / 1000; });
    addEventListener('deviceorientation', e => { if (e.gamma != null) { mx = .5 + Math.max(-.5, Math.min(.5, e.gamma / 50)); my = .5 - Math.max(-.5, Math.min(.5, (e.beta - 45) / 80)); } });
    new IntersectionObserver(e => vis = e[0].isIntersecting).observe(hero);

    const t0 = performance.now(); hero.classList.add('gl');
    (function frame(now) {
      requestAnimationFrame(frame); if (!vis) return;
      const dt = Math.min((now - last) / 1000, .05); last = now;
      sx += (mx - sx) * .06; sy += (my - sy) * .06; on += (onT - on) * .08;
      wind += ((mx - .5) * 1.2 - wind) * .03; ph += dt * (2 + wind * 2);   // el viento sigue al ratón
      gl.uniform1f(U('t'), (now - t0) / 1000); gl.uniform1f(U('wp'), ph); gl.uniform1f(U('ct'), ct); gl.uniform1f(U('on'), on);
      gl.uniform2f(U('ms'), mx, my); gl.uniform2f(U('cm'), cmx, cmy); gl.uniform2f(U('par'), -(sx - .5), -(sy - .5));
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    })(t0);
  }).catch(() => { /* se queda el hero CSS */ });
})();
