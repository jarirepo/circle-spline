import * as chai from 'chai'
const { expect } = chai

import Vector from '../src/js/vector';
const { PI } = Math

describe('Vector', () => {

  it('should initiate a vector', done => {
    const v = new Vector(1,2,3)
    expect(v.x).to.eql(1)
    expect(v.y).to.eql(2)
    expect(v.z).to.eql(3)
    done()
  })

  it('should set the x, y and z components of a vector', done => {
    const v = new Vector()
    v.set(1,2,3)
    expect(v.x).to.eql(1)
    expect(v.y).to.eql(2)
    expect(v.z).to.eql(3)
    done()        
  })

  it('should scale a vector', done => {
    const v = new Vector(1,2,3).scale(2)
    expect(v.x).to.eql(2)
    expect(v.y).to.eql(4)
    expect(v.z).to.eql(6)
    done()        
  })

  it('should add two vectors', done => {
    const u = new Vector(1,2,3)
    const v = new Vector(3,2,1)
    u.add(v)
    expect(u.x).to.eql(4)
    expect(u.y).to.eql(4)
    expect(u.z).to.eql(4)
    done()        
  })
  
  it('should subtract two vectors', done => {
    const u = new Vector(3,5,7)
    const v = new Vector(2,4,6)
    u.sub(v)
    expect(u.x).to.equal(1)
    expect(u.y).to.equal(1)
    expect(u.z).to.equal(1)
    done()        
  })

  it('should return the magnitude of a vector', done => {
    const v = new Vector(2,3,6)
    expect(v.mag()).to.equal(7)
    done()
  })

  it('should return the squared magnitude of a vector', done => {
    const v = new Vector(2,3,6)
    expect(v.magSq()).to.equal(49)
    done()
  })

  it('should normalize a vector', done => {
    const v = new Vector(1,2,3).normalize()
    expect(v.mag()).to.equal(1)
    done()
  })

  it('should return the dot-product of two vectors', done => {
    const u = new Vector(2,3,4)
    const v = new Vector(4,3,2)
    expect(u.dot(v)).to.equal(25)
    done()        
  })

  it('should return the cross-product of two vectors', done => {
    const u = new Vector(2,3,4)
    const v = new Vector(4,3,2)
    const w = u.cross(v)
    expect(w.x).to.equal(-6)
    expect(w.y).to.equal(12)
    expect(w.z).to.equal(-6)
    done()        
  })
  
  it('should return the distance between two points', done => {
    // 7^2 = (3-1)^2 + (5-2)^2 + (10-4)^2
    const p1 = new Vector(3,5,10)
    const p2 = new Vector(1,2,4)
    expect(p1.dist(p2)).to.equal(7)
    done()
  })

  it('should return the squared distance between two points', done => {
    // 7^2 = (3-1)^2 + (5-2)^2 + (10-4)^2
    const p1 = new Vector(3,5,10)
    const p2 = new Vector(1,2,4)
    expect(p1.distSq(p2)).to.equal(49)
    done()
  })

  it('should rotate a vector about the z-axis', done => {
    const v = new Vector(3, 5, 7)
    v.rotateZ(PI)
    expect(v.x | 0).to.equal(-3)
    expect(v.y | 0).to.equal(-5)
    expect(v.z).to.equal(7)
    done()
  })
  
  it('should mirror a vector', done => {
    const v1 = new Vector(2,3,0)
    const v2 = new Vector(1,0,0)
    v1.mirror(v2)
    expect(v1.x).to.equal(2)
    expect(v1.y).to.equal(-3)
    expect(v1.z).to.equal(0)
    done()
  })
})
