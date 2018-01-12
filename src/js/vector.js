const { cos, pow, sin, sqrt } = Math

export default class Vector {
  constructor(x = 0, y = 0, z = 0) {
    this.x = x
    this.y = y
    this.z = z
  }

  set(x, y, z = 0) {
    this.x = x
    this.y = y
    this.z = z
    return this
  }

  scale(val) {
    this.x *= val
    this.y *= val
    this.z *= val
    return this
  }

  rotateZ(ang) {
    const c = cos(ang)
    const s = sin(ang)
    const x = this.x * c - this.y * s
    const y = this.x * s + this.y * c
    this.x = x
    this.y = y
    return this
  }

  add(v) {
    this.x += v.x
    this.y += v.y
    this.z += v.z
    return this
  }

  sub(v) {
    this.x -= v.x
    this.y -= v.y
    this.z -= v.z    
    return this
  }
  
  dot(v) {
    return this.x * v.x + this.y * v.y + this.z * v.z
  }

  cross(v) {
    return new Vector(
      this.y * v.z - this.z * v.y,
      this.z * v.x - this.x * v.z,
      this.x * v.y - this.y * v.x
    )
  }

  mirror(u) {
    // mirrors this vector about the vector u
    const d = this.dot(u)
    this.set(
      2 * d * u.x - this.x,
      2 * d * u.y - this.y,
      2 * d * u.z - this.z
    )
    return this
  }

  dist(v) {
    return sqrt(pow(this.x - v.x, 2) + pow(this.y - v.y, 2) + pow(this.z - v.z, 2))
  }

  distSq(v) {
    return pow(this.x - v.x, 2) + pow(this.y - v.y, 2) + pow(this.z - v.z, 2)
  }

  mag() {
    return sqrt(pow(this.x, 2) + pow(this.y, 2) + pow(this.z, 2))
  }

  magSq() {
    return pow(this.x, 2) + pow(this.y, 2) + pow(this.z, 2)
  }

  normalize() {
    return this.scale(1 / this.mag())
  }

  clone() {
    return new Vector(this.x, this.y, this.z)
  }
}
