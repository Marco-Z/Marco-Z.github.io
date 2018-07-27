
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

var start = null;
var stop = null;

Vue.component('timeline', {
    template: ` \
    <div class="timeline"> \
        <p>{{ name }} <button class="delButton" v-on:click="$emit('deleteMe', name)"> x </button></p>\
    </div>`,
    props: ['legList', 'name'],
    mounted: function () {
        var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);        
        if(!start){
            start = this.legList.features[0].properties.time_start;
        }
        if(!stop){
            stop = this.legList.features[this.legList.features.length - 1].properties.time_stop;
        }
        var total = stop - start;
        this.legList.features.forEach(leg => {
            var legStart = (leg.properties.time_start - start) / total * w;
            var legStop = (leg.properties.time_stop - start) / total * w;
            var legElement = document.createElement("div");
            legElement.style.width = (legStop - legStart) +"px";
            legElement.className = "leg";
            legElement.style.left = legStart + "px";
            legElement.style.background = COLORS[leg.properties.activity];
            var startTime = new Date(parseInt(leg.properties.time_start));
            var stopTime = new Date(parseInt(leg.properties.time_stop));
            legElement.title = leg.properties.activity + ": " + startTime.toLocaleTimeString() + "-" + stopTime.toLocaleTimeString()
            this.$el.appendChild(legElement)
        });
    }
});


var timelines = new Vue({
    data: {
        sources: [],
    },
    el: 'timelines',
    template: ` \
    <div id="timelines"> \
        <timeline v-for="s in sources" \
                v-bind:legList="s" \
                v-bind:name="s.name" \
                v-on:deleteMe="deleteSource">\
        </timeline> \
    </div>`,
    methods: {
        deleteSource: function(name) {
            this.sources = this.sources.filter(function (el) {
                return el.name != name;
            });
        }
    }
});