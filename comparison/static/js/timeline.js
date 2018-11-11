
var COLORS = {
    'stationary': 'rgb(170, 170, 170)',
    'non-motorized': 'rgb(233, 94, 40)',
    'non-motorized/bicycle': 'rgb(245, 153, 30)',
    'non-motorized/pedestrian': 'rgb(210, 104, 26)',
    'non-motorized/pedestrian/run': 'rgb(245, 30, 39)',
    'non-motorized/pedestrian/walk': 'rgb(210, 50, 26)',
    'motorized': 'rgb(38, 174, 147)',
    'motorized/rail': 'rgb(42, 192, 103)',
    'motorized/rail/metro': 'rgb(0, 138, 56)',
    'motorized/rail/tram': 'rgb(75, 206, 128)',
    'motorized/rail/train': 'rgb(3, 183, 76)',
    'motorized/road': 'rgb(44, 133, 172)',
    'motorized/road/bus': 'rgb(75, 155, 190)',
    'motorized/road/car': 'rgb(5, 86, 121)',
};

Vue.component('timeline', {
    template: `
    <div class="timeline">
        <p>{{ name }} <button class="delButton" v-on:click="$emit('deleteMe', name)"> x </button></p>
        <div class="legs"></div>
    </div>`,
    props: ['legList', 'name'],
    mounted: function () {
        var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);        
        if (!this.$parent.start) {
            this.$parent.start = this.legList.features[0].properties.time_start;
        }
        if (!this.$parent.stop) {
            this.$parent.stop = this.legList.features[this.legList.features.length - 1].properties.time_stop;
        }
        var total = this.$parent.stop - this.$parent.start;
        this.legList.features.forEach(leg => {
            var legStart = (leg.properties.time_start - this.$parent.start) / total * w;
            var legStop = (leg.properties.time_stop - this.$parent.start) / total * w;
            var legElement = document.createElement("div");
            legElement.style.width = (legStop - legStart) + "px";
            legElement.className = "leg";
            legElement.style.left = legStart + "px";
            legElement.style.background = COLORS[leg.properties.activity];
            var startTime = new Date(parseInt(leg.properties.time_start));
            var stopTime = new Date(parseInt(leg.properties.time_stop));
            legElement.title = leg.properties.activity + ": " + startTime.toLocaleTimeString() + "-" + stopTime.toLocaleTimeString()
            this.$el.querySelector(".legs").appendChild(legElement)
        });
    }
});



var timelines = new Vue({
    data: {
        sources: [],
        start: null,
        stop: null,
        startPX: null,
    },
    el: 'timelines',
    template: `
    <div id="timelines">
        <timeline v-for="s in sources"
                v-bind:legList="s"
                v-bind:name="s.name"
                v-on:deleteMe="deleteSource">
                v-on:startStop="setStartStop">
        </timeline>
        <div class="range" v-if="start">
            <hr>
            <span>{{ new Date(parseInt(start)).toLocaleString() }}</span>
            <span class="right">{{ new Date(parseInt(stop)).toLocaleString() }}</span>
        </div>
    </div>`,
    methods: {
        deleteSource: function(name) {
            this.sources = this.sources.filter(function (el) {
                return el.name != name;
            });
        },
        startResize: function (event) {
            console.log(event.target);
            console.log(event);
            console.log(document.querySelector(".dragArea"));
            var dragArea = document.querySelector(".dragArea");

            dragArea.style.left = event.clientX + 'px';
            dragArea.style.width = '0px';
            this.startPX = event.clientX;
            document.addEventListener('mousemove', resizeDragArea);
        },
        resize: function (event) {
            console.log(event.target);
            console.log(event);
            var dragArea = document.querySelector(".dragArea");

            var scaleX = document.body.clientWidth / parseInt(dragArea.style.width.split("px")[0]);
            var translationX = -parseInt(dragArea.style.left.split("px")[0]);
            console.log("matrix(" + scaleX + "0,0,1," + translationX + ",0)");
            document.querySelectorAll(".legs").forEach(function (leg) {
                leg.style.transform = "matrix(" + scaleX + ",0,0,1," + translationX + ",0)";
            })
            document.removeEventListener('mousemove', resizeDragArea);

        }
    }
});

function resizeDragArea(event) {
    console.log(event.clientX - timelines.startPX);
    var w = event.clientX - timelines.startPX;
    var dragArea = document.querySelector(".dragArea");
    if(w < 0) {
        document.querySelector(".dragArea").style.left = (timelines.startPX + w) + 'px';
    }
    dragArea.style.width = Math.abs(w) + 'px';

}