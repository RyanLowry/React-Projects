class Meeting {
    constructor(start, end, section) {
        this.id = crypto.randomUUID();
        this.start = start;
        this.end = end;
        this.section = section;
        // this.changedDept = false;
        this.isSelected = false;
    }
}

export default Meeting;