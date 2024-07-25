varying vec3 vColor;
uniform sampler2D uTexture;

void main()
{
    float distanceToCenter = length(gl_PointCoord - 0.5);
    
    if(distanceToCenter > 0.5)
        discard;

    gl_FragColor = vec4(vColor.r * 2.0, vColor.g * 2.0, vColor.b * 2.0, 1.0);
}