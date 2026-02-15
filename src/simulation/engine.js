/**
 * Discrete-Event Simulation Engine
 *
 * Manages a priority event queue, a waiting queue, servers,
 * and tracks history for visualization.
 */

let entityIdCounter = 0

export class SimulationEngine {
  constructor({ numServers = 1, capacity = Infinity, arrivalGen, serviceGen }) {
    this.numServers = numServers
    this.capacity = capacity // max entities in system (queue + in service)
    this.arrivalGen = arrivalGen
    this.serviceGen = serviceGen

    this.clock = 0
    this.events = [] // min-heap by time
    this.queue = []
    this.servers = Array.from({ length: numServers }, (_, i) => ({
      id: i,
      busy: false,
      entity: null,
    }))

    // Stats
    this.served = 0
    this.rejected = 0
    this.totalWait = 0
    this.totalSystem = 0
    this.totalArrivals = 0

    // History for charts (sampled)
    this.history = []
    this.waitTimes = []
    this.lastHistoryTime = 0

    // Entities in system for animation
    this.entities = new Map()

    entityIdCounter = 0
  }

  /** Schedule an event */
  scheduleEvent(time, type, entityId) {
    const event = { time, type, entityId }
    // Insert into sorted position (simple for small event lists)
    let i = this.events.length
    this.events.push(event)
    // Bubble up
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2)
      if (this.events[parent].time <= this.events[i].time) break
      ;[this.events[parent], this.events[i]] = [this.events[i], this.events[parent]]
      i = parent
    }
  }

  /** Pop next event */
  popEvent() {
    if (this.events.length === 0) return null
    const min = this.events[0]
    const last = this.events.pop()
    if (this.events.length > 0) {
      this.events[0] = last
      this._siftDown(0)
    }
    return min
  }

  _siftDown(i) {
    const n = this.events.length
    while (true) {
      let smallest = i
      const l = 2 * i + 1
      const r = 2 * i + 2
      if (l < n && this.events[l].time < this.events[smallest].time) smallest = l
      if (r < n && this.events[r].time < this.events[smallest].time) smallest = r
      if (smallest === i) break
      ;[this.events[smallest], this.events[i]] = [this.events[i], this.events[smallest]]
      i = smallest
    }
  }

  /** Initialize with first arrival */
  start() {
    this.scheduleFirstArrival()
  }

  scheduleFirstArrival() {
    const id = entityIdCounter++
    const interarrival = this.arrivalGen()
    this.scheduleEvent(this.clock + interarrival, 'arrival', id)
  }

  /** Process events up to `targetTime` */
  advanceTo(targetTime) {
    while (this.events.length > 0 && this.events[0].time <= targetTime) {
      const event = this.popEvent()
      this.clock = event.time

      if (event.type === 'arrival') {
        this.processArrival(event)
      } else if (event.type === 'departure') {
        this.processDeparture(event)
      }

      // Sample history periodically
      if (this.clock - this.lastHistoryTime >= 0.1) {
        this.recordHistory()
        this.lastHistoryTime = this.clock
      }
    }

    this.clock = targetTime
  }

  processArrival(event) {
    this.totalArrivals++

    // Schedule next arrival
    const nextId = entityIdCounter++
    const interarrival = this.arrivalGen()
    this.scheduleEvent(this.clock + interarrival, 'arrival', nextId)

    // Check capacity
    const systemSize = this.queue.length + this.servers.filter(s => s.busy).length
    if (systemSize >= this.capacity) {
      this.rejected++
      return
    }

    // Create entity
    const entity = {
      id: event.entityId,
      arrivalTime: this.clock,
      serviceStartTime: null,
      state: 'waiting', // waiting | serving | done
      serverIndex: null,
    }
    this.entities.set(entity.id, entity)

    // Try to find a free server
    const freeServer = this.servers.find(s => !s.busy)
    if (freeServer) {
      this.startService(entity, freeServer)
    } else {
      this.queue.push(entity)
    }
  }

  startService(entity, server) {
    entity.state = 'serving'
    entity.serviceStartTime = this.clock
    entity.serverIndex = server.id
    server.busy = true
    server.entity = entity

    const serviceTime = this.serviceGen()
    this.scheduleEvent(this.clock + serviceTime, 'departure', entity.id)
  }

  processDeparture(event) {
    const entity = this.entities.get(event.entityId)
    if (!entity) return

    const server = this.servers[entity.serverIndex]
    server.busy = false
    server.entity = null

    // Record stats
    const waitTime = entity.serviceStartTime - entity.arrivalTime
    const systemTime = this.clock - entity.arrivalTime
    this.totalWait += waitTime
    this.totalSystem += systemTime
    this.served++
    this.waitTimes.push(waitTime)

    // Keep only recent wait times for distribution
    if (this.waitTimes.length > 500) {
      this.waitTimes = this.waitTimes.slice(-500)
    }

    entity.state = 'done'
    this.entities.delete(entity.id)

    // Dequeue next
    if (this.queue.length > 0) {
      const next = this.queue.shift()
      this.startService(next, server)
    }
  }

  recordHistory() {
    const queueLen = this.queue.length
    const inService = this.servers.filter(s => s.busy).length
    this.history.push({
      time: Math.round(this.clock * 100) / 100,
      queueLength: queueLen,
      systemLength: queueLen + inService,
      serverUtil: inService / this.numServers,
    })

    // Keep history bounded
    if (this.history.length > 1000) {
      this.history = this.history.slice(-1000)
    }
  }

  /** Get current snapshot for rendering */
  getSnapshot() {
    const inService = this.servers.filter(s => s.busy).length
    const queueLength = this.queue.length
    const avgWait = this.served > 0 ? this.totalWait / this.served : 0
    const avgSystem = this.served > 0 ? this.totalSystem / this.served : 0

    return {
      clock: this.clock,
      queueLength,
      systemLength: queueLength + inService,
      serverUtil: this.numServers > 0 ? inService / this.numServers : 0,
      served: this.served,
      rejected: this.rejected,
      totalArrivals: this.totalArrivals,
      avgWait,
      avgSystem,
      avgQueueLength: this.history.length > 0
        ? this.history.reduce((s, h) => s + h.queueLength, 0) / this.history.length
        : 0,
      avgSystemLength: this.history.length > 0
        ? this.history.reduce((s, h) => s + h.systemLength, 0) / this.history.length
        : 0,
      servers: this.servers.map(s => ({ id: s.id, busy: s.busy })),
      queueEntities: this.queue.map(e => ({ id: e.id })),
      servingEntities: this.servers
        .filter(s => s.busy && s.entity)
        .map(s => ({ id: s.entity.id, serverIndex: s.id })),
    }
  }
}
