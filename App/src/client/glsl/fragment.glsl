// FRAGMENT SHADER
precision mediump float;

void main() {
	vec2 st = vUv;
	vec3 color = vec3(st, 1.0);
	gl_FragColor = vec4(color,1.0);
}
