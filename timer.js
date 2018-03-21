class GTimer {
    constructor({ totalTime, timeDelay, onTick, callback, beforeStart, autoStart = false } = {}) {
        this.ID = GTimer.timerIndex
        GTimer.AllTimers[GTimer.timerIndex] = this
        GTimer.timerIndex++

        this.totalTime = totalTime; // in milliseconds

        this._startTime = 0
        this.timePassed = 0
        this.pauseStartTime = 0
        this.pauseTime = 0

        this.timeDelay = timeDelay
        this.onTick = onTick

        this.beforeStart = beforeStart
        this.callback = callback

        this.started = false
        this.paused = false
        this.finished = false

        this._timeoutHolder = null

        if (autostart === true) this.Start()
    }

    Start (timepassed) {
        if (typeof this.beforeStart == 'function') this.beforeStart()

        this.paused = false
        this.started = true
        this.finished = false

        this.timePassed = 0

        this.pauseStartTime = 0
        this.pauseTime = 0

        this._startTime = Date.now()

        if (timepassed != undefined) this.UpdateTimes(timepassed)

        this._Repeat()

        // if timer started while tab is invisible
        if (document.hidden === true) this.Pause()
    }
    UpdateTimes (timepassed) {
        this._startTime = Date.now() - timepassed
        this.timePassed = timepassed
    }
    _Repeat () {
        if (this.finished === true) return

        if (this.timePassed >= this.totalTime) {
            let difference = this.timePassed - this.totalTime

            this.timePassed = this.totalTime

            this.Stop()

            if (typeof this.onTick == 'function') {
                this.onTick(this.timePassed, this.totalTime)
            }

            if (typeof this.callback == 'function') {
                this.callback(difference)
            }

            return
        }

        if (typeof this.onTick == 'function') {
            this.onTick(this.timePassed, this.totalTime)
        }

        this.timePassed = Date.now() - this._startTime - this.pauseTime

        if (typeof window.requestAnimationFrame === 'undefined') {
            this._timeoutHolder = setTimeout(this._Repeat.bind(this), this.timeDelay)
        }
        else {
            function reqAnFrame () {
                this._timeoutHolder = setTimeout(this._Repeat.bind(this), this.timeDelay)
            }

            requestAnimationFrame(reqAnFrame.bind(this))
        }
    }

    Pause () {
        this.pauseStartTime = Date.now()

        if (this.started) this.paused = true

        if (this._timeoutHolder) clearTimeout(this._timeoutHolder)
    }
    Continue (inactiveTab = false) {
        if (this.paused !== true) return

        if (!inactiveTab) {
            this.pauseTime += +new Date - this.pauseStartTime
        }

        this._Repeat()
    }

    Stop () {
        this.paused = false
        this.started = false
        this.finished = true
        this.timePassed = this.totalTime
        clearTimeout(this._timeoutHolder)
        delete GTimer.AllTimers[this.ID]
    }

    static PauseAll () {
        for (var x in GTimer.AllTimers) {
            GTimer.AllTimers[x].Pause()
        }
    }
    static ContinueAll (inactiveTab = true) {
        for (var x in GTimer.AllTimers) {
            GTimer.AllTimers[x].Continue(inactiveTab)
        }
    }
}

void function Init () {
    GTimer.AllTimers = {}
    GTimer.timerIndex = 1

    document.addEventListener('visibilitychange', function () {
        if (document.hidden === true) GTimer.PauseAll()
        else GTimer.ContinueAll()
    })
}
