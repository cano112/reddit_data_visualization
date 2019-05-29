const margin = {top: 10, right: 10, bottom: 10, left: 10};
const width = 3840 - margin.left - margin.right;
const height = 2160 - margin.top - margin.bottom;
const lexer = new Lexer();
const tagger = new POSTagger();
const bannedTags = ['IN', 'CD', 'DT', '.', ',', '#', '$', ':', '!', ';', '*'];
d3.csv("data/submissions.csv").then(data => {
    let submissionWordsCount = {};

    let addToWordCountMap = word => {
        if(bannedTags.indexOf(word[1]) === -1) {
            if(word[0] === '&#x') {
                console.log(word[1]);
            }
            let currentCount = submissionWordsCount[word[0]];
            if(currentCount === undefined) {
                currentCount = 0;
            }
            submissionWordsCount[word[0]] = currentCount + 1;
        }
    };

    let prepareSvg = () => {
        return d3.select("#visualization")
            .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
            .append("g")
                .attr("transform",
                    "translate(" + margin.left + "," + margin.top + ")");
    };

    let createWordCloud = (svg, stats) => {
        let layout = d3.layout.cloud()
            .size([width, height])
            .words(Object.keys(stats).map(key => ({text: key, size: stats[key]})))
            .padding(10)
            .fontSize(d => d.size)
            .on("end", words => drawWords(svg, layout, words));
        layout.start();
    };

    let drawWords = (svg, layout, words) => {
        svg
            .append("g")
                .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
            .selectAll("text")
            .data(words)
                .enter().append("text")
                .style("font-size", d => d.size + "px")
                .attr("text-anchor", "middle")
                .attr("transform", d => "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")")
                .text(d => d.text);
    };

    data.forEach(row => {
        const bodyWords = lexer.lex(row.body);
        const titleWords = lexer.lex(row.title);
        tagger.tag(titleWords).forEach(addToWordCountMap);
        tagger.tag(bodyWords).forEach(addToWordCountMap);
    });

    let svg = prepareSvg();
    createWordCloud(svg, submissionWordsCount);
});
