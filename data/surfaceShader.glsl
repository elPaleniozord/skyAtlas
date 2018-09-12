precision highp float;
precision highp int;
uniform float time;
uniform sampler2D iChannel1;
uniform sampler2D iChannel0;
uniform vec2 resolution;
varying vec2 vUv;
float snoise(vec3 uv, float res)
{
    const vec3 s = vec3(1e0, 1e2, 1e4);
    uv *= res;
    vec3 uv0 = floor(mod(uv, res)) * s;
    vec3 uv1 = floor(mod(uv + vec3(1.), res)) * s;
    vec3 f = fract(uv);
    f = f * f * (3.0 - 2.0 * f);
    vec4 v = vec4(uv0.x + uv0.y + uv0.z, uv1.x + uv0.y + uv0.z, uv0.x + uv1.y + uv0.z, uv1.x + uv1.y + uv0.z);
    vec4 r = fract(sin(v * 1e-3) * 1e5);
    float r0 = mix(mix(r.x, r.y, f.x), mix(r.z, r.w, f.x), f.y);
    r = fract(sin((v + uv1.z - uv0.z) * 1e-3) * 1e5);
    float r1 = mix(mix(r.x, r.y, f.x), mix(r.z, r.w, f.x), f.y);
    return mix(r0, r1, f.z) * 2. - 1.;
}
float freqs[4];
void main()
{
    freqs[0] = texture2D(iChannel1, vec2(0.01, 0.25)).x;
    freqs[1] = texture2D(iChannel1, vec2(0.07, 0.25)).x;
    freqs[2] = texture2D(iChannel1, vec2(0.15, 0.25)).x;
    freqs[3] = texture2D(iChannel1, vec2(0.30, 0.25)).x;
    float brightness = freqs[1] * 0.25 + freqs[2] * 0.25;
    float radius = 0.24 + brightness * 0.2;
    float invRadius = 1.0 / radius;
    vec3 orange = vec3(0.8, 0.65, 0.3);
    vec3 orangeRed = vec3(0.8, 0.35, 0.1);
    float time = time * 0.12;
    float aspect = resolution.x / resolution.y;
    vec2 uv = vUv.xy / resolution.xy;
    vec2 p = -0.5 + uv;
    p.x *= aspect;
    float fade = pow(length(2.0 * p), 0.5);
    float fVal1 = 1.0 - fade;
    float fVal2 = 1.0 - fade;
    float angle = atan(p.x, p.y) / 6.2832;
    float dist = length(p);
    vec3 coord = vec3(angle, dist, time * 0.1);
    float newTime1 = abs(snoise(coord + vec3(0.0, -time * (0.35 + brightness * 0.001), time * 0.015), 15.0));
    float newTime2 = abs(snoise(coord + vec3(0.0, -time * (0.15 + brightness * 0.001), time * 0.015), 45.0));
    for (int i = 1; i <= 7; i++)
    {
        float power = pow(2.0, float(i + 1));
        fVal1 += (0.5 / power) * snoise(coord + vec3(0.0, -time, time * 0.2), (power * (10.0) * (newTime1 + 1.0)));
        fVal2 += (0.5 / power) * snoise(coord + vec3(0.0, -time, time * 0.2), (power * (25.0) * (newTime2 + 1.0)));
    }
    float corona = pow(fVal1 * max(1.1 - fade, 0.0), 2.0) * 50.0;
    corona += pow(fVal2 * max(1.1 - fade, 0.0), 2.0) * 50.0;
    corona *= 1.2 - newTime1;
    vec3 sphereNormal = vec3(0.0, 0.0, 1.0);
    vec3 dir = vec3(0.0);
    vec3 center = vec3(0.5, 0.5, 1.0);
    vec3 starSphere = vec3(0.0);
    vec2 sp = -1.0 + 2.0 * uv;
    sp.x *= aspect;
    sp *= (2.0 - brightness);
    float r = dot(sp, sp);
    float f = (1.0 - sqrt(abs(1.0 - r))) / (r) + brightness * 0.5;
    if (dist < radius)
    {
    O = vec4(0);
//Centered coordinates.
vec2 P = (I-.5*iResolution.xy)*2.2/iResolution.y;
//Iterate for radius.
for(float i = 1.;i<1.7;i+=.01)
{
    //Calculate twisting sphere rays.
    vec3 R = vec3(P,sqrt(i-dot(P,P)));
    R.xy *= mat2(cos(i*.1),sin(i*.1),sin(i*.1),-cos(i*.1));
    //Add light rays.
  O += .025*pow(texture(iChannel0,R.xy/sqrt(R.z)-.1*iTime),vec4(i*4.-3.));
}
//Create edge glow and attenuation in space.
O *= vec4(.65,.4,.25,1)/(abs(dot(P,P)-1.)+.2),pow(1.-sqrt(max(1.-dot(P,P),0.)),2.);
//Calculate disk distance for solar flares.
float D = 1.5-length(P+P.y*.4+.1*cos(P.x*6.+.2*iTime));

//Added center glow.
O += vec4(2,1,.5,0)*(exp(-dot(P,P)) +
//Calculate the solar flares.
.1*smoothstep(.8,1.,cos(iTime/8.+P.x+P.y*.4))*(cos(P.y*8.+iTime)*.3+.7)*exp(cos(P.x+P.y*.4+iTime)
-10.*abs((cos(D*38.+P.x*17.+2.*iTime)*.1+.9)*D)));
        corona *= pow(dist * invRadius, 24.0);
        vec2 newUv;
        newUv.x = sp.x * f;
        newUv.y = sp.y * f;
        newUv += vec2(time, 0.0);
        vec3 texSample = texture2D(iChannel0, newUv).rgb;
        float uOff = (texSample.g * brightness * 4.5 + time);
        vec2 starUV = newUv + vec2(uOff, 0.0);
        starSphere = texture2D(iChannel0, starUV).rgb;
    }
     float starGlow = min(max(1.0 - dist * (1.0 - brightness), 0.0), 1.0);
    gl_FragColor.rgb = vec3(f * (0.75 + brightness * 0.3) * orange) + starSphere + corona * orange + starGlow * orangeRed;
    gl_FragColor.a = 0.99;
}
