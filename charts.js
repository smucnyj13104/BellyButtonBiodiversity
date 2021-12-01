function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("samples.json").then((data) => {
    var sampleNames = data.names;

    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    var firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
    //console.log("working")
  });
}

// Initialize the dashboard
init();

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildMetadata(newSample);
  buildCharts(newSample);
  
}

// Demographics Panel 
function buildMetadata(sample) {
  d3.json("samples.json").then((data) => {
    var metadata = data.metadata;
    // Filter the data for the object with the desired sample number
    var resultArray = metadata.filter(sampleObj => sampleObj.id == sample);
    var result = resultArray[0];
    // Use d3 to select the panel with id of `#sample-metadata`
    var PANEL = d3.select("#sample-metadata");

    // Use `.html("") to clear any existing metadata
    PANEL.html("");

    // Use `Object.entries` to add each key and value pair to the panel
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.
    Object.entries(result).forEach(([key, value]) => {
      PANEL.append("h6").text(`${key.toUpperCase()}: ${value}`);
    });

  });
}

// 1. Create the buildCharts function.
function buildCharts(sample) {
  // 2. Use d3.json to load and retrieve the samples.json file 
  d3.json("samples.json").then((data) => {
    // 3. Create a variable that holds the samples array. 
    var sampleData = data.samples;
    // 3. Create a variable that holds the meta array. 
    var metaData = data.metadata;
    // 1. Create a variable that filters the metadata array for the object with the desired sample number.
    var metaResultArray = metaData.filter(sampleObj => sampleObj.id == sample); 
    // 4. Create a variable that filters the samples for the object with the desired sample number.
    var sampleResultArray = sampleData.filter(sampleObj => sampleObj.id == sample);    
    //  5. Create a variable that holds the first sample in the array.
    var sampleResult = sampleResultArray[0];
    // 2. Create a variable that holds the first sample in the metadata array.
    var metaResult = metaResultArray[0]
    // 6. Create variables that hold the otu_ids, otu_labels, and sample_values.
    var otuIds = sampleResult.otu_ids;
    var otuLabels = sampleResult.otu_labels;
    var otuSampleValues = sampleResult.sample_values;
    //6 .Create variable that holds the wash freq.
    var washFreq = parseFloat(metaResult.wfreq);

    // 7. Create the yticks for the bar chart.
    // Hint: Get the the top 10 otu_ids and map them in descending order  
    //  so the otu_ids with the most bacteria are last. 
  
    var sortedSliced = otuIds.map((x, i) => {return [x, otuSampleValues[i]]}).sort((a,b) => parseInt(a[1]) - parseInt(b[1])).slice(Math.max(otuSampleValues.length - 10,0));
    
    var xticks = [];
    for ( var i = 0; i < sortedSliced.length; i++ ) {
      xticks.push(sortedSliced[i][1] );
    }
    var yticks = [];
    for ( var i = 0; i < sortedSliced.length; i++ ) {
      yticks.push("OTU " + sortedSliced[i][0] );
    }
    
    // 8. Create the trace for the bar chart.
    var barData = [{
      x: xticks,
      y: yticks,
      type: "bar",
      orientation: 'h'
    }];
    // 9. Create the layout for the bar chart. 
    var barLayout = {
      autosize:true, title: "Top 10 Bacteria Cultures Found", automargin:true
    };
    // 10. Use Plotly to plot the data with the layout. 
    Plotly.newPlot("bar", barData, barLayout);
  
  
    // 1. Create the trace for the bubble chart.

    var bubbleData = [{
      type:"scatter",
      mode:"markers",
      x: otuIds,
      y: otuSampleValues,
      text: otuLabels,
      marker: {
        size: otuSampleValues,
        color: otuIds,
        sizemode: 'area',
        sizeref: 0.05
      },
      hovertemplate: '%{text}<br>'
    }];
  
    // 2. Create the layout for the bubble chart.
    var bubbleLayout = {
      title: 'Bacteria Cultures per Sample',
      xaxis: {title: "OTU ID" },
      yaxis: {title: "Cultures per Sample" },
      hovermode: 'closest'
      };
    // 3. Use Plotly to plot the data with the layout.
    Plotly.newPlot("bubble",bubbleData,bubbleLayout); 
    
    // 4. Create the trace for the gauge chart.
    var gaugeData = [  {
      domain: { x: [0, 1], y: [0, 1] },
      value: washFreq,
      title: { text: '<b>Belly Button Washing Frequency</b><br>Scrubs per Week' },
      type: "indicator",
      mode: "gauge+number",
      gauge: {
        axis: { range: [null, 10] },
        bar: { color: "black"},
        steps: [
          { range: [0, 2], color: 'rgb(31, 119, 180)' },
          { range: [2, 4], color: 'rgb(255, 127, 14)' },
          { range: [4, 6], color: 'rgb(44, 160, 44)' },
          { range: [6, 8], color: 'rgb(214, 39, 40)' },
          { range: [8, 10], color: 'rgb(148, 103, 189)' }
        ],
      }
    }
     
    ];
      
    // 5. Create the layout for the gauge chart.
    var gaugeLayout = { 
      autosize:true, automargin:true
    };
    // 6. Use Plotly to plot the gauge data and layout.
    Plotly.newPlot("gauge",gaugeData,gaugeLayout);
  });

}

