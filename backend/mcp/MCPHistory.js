class MCPHistory {
    constructor(step) {
        this.step = step;
        this.timestamp = new Date();
        this.status = 'PENDING';
        this.error = null;
    }

    markAsCompleted() {
        this.status = 'COMPLETED';
        this.timestamp = new Date();
    }

    markAsFailed(error) {
        this.status = 'FAILED';
        this.error = error;
        this.timestamp = new Date();
    }

    toJSON() {
        return {
            step: this.step,
            timestamp: this.timestamp,
            status: this.status,
            error: this.error
        };
    }
}

module.exports = MCPHistory; 