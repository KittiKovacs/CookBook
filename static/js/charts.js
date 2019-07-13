queue()
  .defer(d3.json, "/data_recipes")
  .await(createCharts);

function createCharts(error, data) {
  var recipes = data;

  var ndx = crossfilter(recipes);

  var dimDifficulty = ndx.dimension(dc.pluck("difficulty"));
  var groupDifficulty = dimDifficulty.group();

  dc.pieChart("#difficulty")
    .height(200)
    // .useViewBoxResizing(true) //to make the chart responsive
    .externalRadiusPadding(40)
    .dimension(dimDifficulty)
    .group(groupDifficulty)
    .renderLabel(false) //we use the legend instead
    .transitionDuration(1500);

  var dimCategory = ndx.dimension(dc.pluck("category"));
  var groupCategory = dimCategory.group();

  dc.pieChart("#category")
    .height(200)
    // .useViewBoxResizing(true) //to make the chart responsive
    .externalRadiusPadding(40)
    .dimension(dimCategory)
    .group(groupCategory)
    .renderLabel(false) //we use the legend instead
    .transitionDuration(1500);

  var dimCuisine = ndx.dimension(dc.pluck("cuisine"));
  var groupCuisine = dimCuisine.group();

  rowChartCuisine = dc.rowChart("#cuisine");
  rowChartCuisine
    .height(600)
    .width(250)
    .dimension(dimCuisine)
    .group(groupCuisine)
    .elasticX(true)
    .xAxis()
    .ticks(3);

  rowChartCuisine.rowsCap(20);

  var dimauthor = ndx.dimension(dc.pluck("author"));
  var groupauthor = dimauthor.group().reduceSum(dc.pluck("upvotes"));

  rowChartAuthor = dc.rowChart("#author");
  rowChartAuthor
    .height(300)
    .width(250)
    .dimension(dimauthor)
    .group(groupauthor)
    .elasticX(true)
    .xAxis()
    .ticks(3);

  rowChartAuthor.rowsCap(10);

  var total = ndx.groupAll().reduce(
    //p keeps track of the changes, v will be input values from the dataset
    //function adder
    function(p, v) {
      p.count++;
      return p;
    },
    //function remover
    function(p, v) {
      p.count--;
      return p;
    },
    //Initialise the Reducer
    function() {
      return { count: 0 };
    }
  );

  dc.numberDisplay("#totalRecipes")
    .formatNumber(d3.format("d"))
    .valueAccessor(function(d) {
      return d.count;
    })
    .group(total);

  var allDimension = ndx.dimension(function(d) {
    return d;
  });

  dc.dataTable("#table")
    .useViewBoxResizing(true) //to make the chart responsive
    .dimension(allDimension)
    .group(function(data) {
      return data;
    })
    .size(Infinity)
    .columns([
      {
        label: "Recipe Name",
        format: function(d) {
          return d.recipe_name;
        }
      },
      {
        label: "Votes",
        format: function(d) {
          return d.upvotes;
        }
      },
      {
        label: "Cuisine",
        format: function(d) {
          return d.cuisine;
        }
      },
      {
        label: "Type of meal",
        format: function(d) {
          return d.category;
        }
      },
      {
        label: "Author",
        format: function(d) {
          return d.author;
        }
      },
      {
        label: "View recipe",
        format: function(d) {
          // get the id value and remove the "
          var keystring = JSON.stringify(d._id["$oid"]).replace(/"/g, "");
          // var key = keystring.replace(/"/g, "");
          // return "how to add this link ?? view_recipe/" + keystring;
          return '<a href="https://www.google.com/"></a>';
        }
      }
    ])
    // .sortBy(d.upvotes)
    .showGroups(false) // this will remove the [object][object] at the top of the rows
    .sortBy(function(d) {
      return d.upvotes;
    })
    .order(d3.descending);
  dc.renderAll();
}
