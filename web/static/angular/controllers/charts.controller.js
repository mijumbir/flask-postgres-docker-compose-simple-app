app.controller('chartsController', ['$scope', '$http', '$timeout', '$interval', function($scope, $http, $timeout, $interval) {

  $scope.systems = undefined;
	$scope.system_list = undefined;
	$scope.component_list = undefined;
	$scope.output_comp_list = undefined
	$scope.output_sys_list = undefined
	$scope.index = undefined
	$scope.all_components = undefined
	$scope.index_to_delete = undefined


	var defaultSort = 'Alias';
    $scope.tags = [];
    //$scope.msg = "";
    $scope.sort = defaultSort;
    $scope.reverse = false;
    $scope.selectedPageSize = 20;
    $scope.pageSizes = [20, 100, 250];
    $scope.currentPage = 0;
    //$scope.pages = [1, 2, 3, 4];

    $scope.point = {}


    var updateInterval = 5*601000 //Fetch data every 5 min
    var realtime       = 'off' //If == to on then fetch data every x seconds. else stop fetching
    var realtime_btn_id = '#realtime'


    $scope.statistics = {power:{}, flow:{},chilled:{},cooling:{},cop:{},kwton:{}}



  initialize_summary()




	$http.get('/api/initial_chart_data').then(function(response) {

          $scope.system_list = response.data.system_list
          $scope.component_list = response.data.component_list
          $scope.points = response.data.pt_list
          $scope.index = response.data.index
          $scope.all_components = response.data.all_components

          status_data = response.data.status_data

          flow_data = response.data.flow_data

          load_data = response.data.load_data

          //temp_out = response.data.temp_out

          temp = response.data.temp

          energy = response.data.energy

          //console.log(temp)
          console.log(energy)


          var data1 = {label: "Evaporator Flow Rate (L/s)", data : response.data.chart, color: '#0635FB'}
          var data2 = {label: "Condensor Flow Rate (L/s)", data : response.data.chart_2, color: '#145A32'}
          var data3 = {label: "Flow Set Point (L/s)", data : response.data.chart_3, color: '#781F22'}
          dataset = [[data1, data2, data3]]

          console.log(dataset)

          //realtime_chart(status_data)

          //chart_id = '#interactive'
          //y_max = 0
          //y_min = 1


          //create_line_chart()
          //create_area_chart()
          //create_bar_chart()
          //create_donut_chart()
          realtime_charts(dataset, ['#interactive'], 0, 100)
          realtime_charts(status_data, ['#status1','#status2','#status3','#status4'], 0, 1)
          realtime_charts(load_data, ['#load1','#load2','#load3','#load4'], 0, 1)
          realtime_charts(flow_data, ['#flow1','#flow2','#flow3','#flow4'], 80, 85)
          realtime_charts(energy, ['#energy1','#energy2','#energy3','#energy4'], 0, 8000)

          //realtime_charts(temp_out, ['#temp1','#temp2','#temp3','#temp4'], 0, 15)
          realtime_charts(temp, ['#cool1','#cool2','#cool3','#cool4'], 5, 8)
          
          

          //selectCharts()

	});


  function set_display_colours(){
            for (const [key, value] of Object.entries($scope.statistics)) {
                 //console.log(key, value);
                if ($scope.statistics[key].direction == 'increased'){
                      document.getElementById(key+"_constant").style.display = "none";
                      document.getElementById(key+"_down").style.display = "none";
                }
                else if ($scope.statistics[key].direction == 'decreased'){
                      document.getElementById(key+"_constant").style.display = "none";
                      document.getElementById(key+"_up").style.display = "none";
                }
                else if ($scope.statistics[key].direction == 'constant'){
                      document.getElementById(key+"_down").style.display = "none";
                      document.getElementById(key+"_up").style.display = "none";
                }

                if ($scope.statistics[key].change > 10){$scope.statistics[key].bg = 'bg-danger'}
                else if ($scope.statistics[key].change < 5){$scope.statistics[key].bg = 'bg-success'}
                else{$scope.statistics[key].bg = 'bg-warning'}
            }

          document.getElementById("summary").style.display = "inline";
 }


  function initialize_summary(){

    document.getElementById("summary").style.display = "none";

    $http.get('/api/initialize_summary').then(function(response) {


        $scope.statistics.power.value = formatter(response.data.energy)
        $scope.statistics.power.change = Math.abs(response.data.energy_change)
        $scope.statistics.power.direction = response.data.direction

        $scope.statistics.flow.value = formatter(response.data.current_flow)
        $scope.statistics.flow.change = Math.abs(response.data.pct_flow)
        $scope.statistics.flow.direction = response.data.flow_direction

        $scope.statistics.cooling.value = formatter(response.data.current_cooling)
        $scope.statistics.cooling.change = Math.abs(response.data.pct_cooling)
        $scope.statistics.cooling.direction = response.data.cooling_direction

        $scope.statistics.chilled.value = formatter(response.data.current_chilled)
        $scope.statistics.chilled.change = Math.abs(response.data.pct_chilled)
        $scope.statistics.chilled.direction = response.data.chilled_direction

        $scope.statistics.cop.value = formatter(response.data.current_cop)
        $scope.statistics.cop.change = Math.abs(response.data.pct_cop)
        $scope.statistics.cop.direction = response.data.cop_direction

        $scope.statistics.kwton.value = formatter(response.data.current_kwton)
        $scope.statistics.kwton.change = Math.abs(response.data.pct_kwton)
        $scope.statistics.kwton.direction = response.data.kwton_direction

        set_display_colours()

    });
  }


  function formatter(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

    function selectCharts(){
        var _list = ["lineC", "areaC"]
        for (var i = 0; i<_list.length; i += 1) {
                  var x = document.getElementById(_list[i]);
                  if (x.style.display === "none") {
                    x.style.display = "block";
                  } else {
                    x.style.display = "none";
                  }
        }

    }


    function realtime_charts(dataset, chart_ids, y_min, y_max){

        for (var i = 0; i<dataset.length; i += 1) {

            create_chart(dataset[i], chart_ids[i], y_min, y_max)

        }
    }



    function create_chart(dataset, chart_id, y_min, y_max) {
            plot = initialize_graph(dataset, chart_id, y_min, y_max)
            plot.draw()
            //interactive_plot.setData([getRandomData()])
            //INITIALIZE REALTIME DATA FETCHING
            if (realtime === 'on') {
              update(dataset, chart_id)
            }

            //REALTIME TOGGLE
            $(realtime_btn_id+' .btn').click(function () {
              if ($(this).data('toggle') === 'on') {
                realtime = 'on'
                document.getElementById("on_button").disabled = true;
                document.getElementById("off_button").disabled = false;
                update(dataset, chart_id)
              }
              else {
                realtime = 'off'
                document.getElementById("on_button").disabled = false;
                document.getElementById("off_button").disabled = true;
              }
              //
            })
            // END INTERACTIVE CHART
    }
    function initialize_graph(dataset, chart_id, y_min, y_max){
      _plot = $.plot(chart_id, dataset,
              {
                grid: {
                  borderColor: '#f3f3f3',
                  borderWidth: 1,
                  //backgroundColor: { colors: ["#000", "#999"] },
                  tickColor: '#f3f3f3'
                },
                series: {
                  color: '#3c8dbc',
                  lines: {
                    lineWidth: 1,
                    show: true,
                    fill: true
                  },
                },
                yaxis: {
                  min: y_min,
                  max: y_max,
                  show: true
                },
                xaxis: {
                  show: true,
                  mode: "time",
                  timeformat: "%d-%b %H:%M"
                },
                legend: {
                    show: true,
                    labelBoxBorderColor: "#fff",
                    position: 'nw'
                }
              }
            )
        return _plot
    }

    function update(dataset, chart_id) {
          data = []
          for (var i=0; i<dataset.length; i++){
              data.push({'tag':dataset[i].label, 'last_time':dataset[i].data[dataset[i].data.length - 1][0]})
              if (dataset[i].label == 'B40-TT-8210D-001'){
              }
          }
          var parameters = { params: {charts:data} };
            $http.get('/api/update_chillers_data', parameters).then(function(response) {
                real_time_updates = response.data.update
              for (var i=0; i<dataset.length; i++){
                  new_array = real_time_updates[dataset[i].label]
                  if (new_array.length > 0) {
                      dataset[i].data.slice(new_array.length)
                      dataset[i].data = dataset[i].data.concat(new_array)
                  }
              }
                plot = initialize_graph(dataset, chart_id)
                plot.draw()
                if (realtime === 'on') {
                  setTimeout(update, updateInterval, dataset, chart_id)   // the function_name, run interval and parameters to the function
                }
          });


    }
    function create_area_chart() {
           // FULL WIDTH STATIC AREA CHART
        var areaData = [[2, 88.0], [3, 93.3], [4, 102.0], [5, 108.5], [6, 115.7], [7, 115.6],
          [8, 124.6], [9, 130.3], [10, 134.3], [11, 141.4], [12, 146.5], [13, 151.7], [14, 159.9],
          [15, 165.4], [16, 167.8], [17, 168.7], [18, 169.5], [19, 168.0]]
        $.plot('#area-chart', [areaData], {
          grid  : {
            borderWidth: 0
          },
          series: {
            shadowSize: 0, // Drawing is faster without shadows
            color     : '#00c0ef',
            lines : {
              fill: true //Converts the line chart to area chart
            },
          },
          yaxis : {
            show: false
          },
          xaxis : {
            show: false
          }
        })
        /* END AREA CHART */
    }
    function create_bar_chart() {
      // BAR CHART
    var bar_data = {
      data : [[1,10], [2,8], [3,4], [4,13], [5,17], [6,9]],
      bars: { show: true }
    }
    $.plot('#bar-chart', [bar_data], {
      grid  : {
        borderWidth: 1,
        borderColor: '#f3f3f3',
        backgroundColor: '#000000',
        tickColor  : '#f3f3f3'
      },
      series: {
         bars: {
          show: true, barWidth: 0.5, align: 'center',
        },
      },
      colors: ['#3c8dbc'],
      xaxis : {
        ticks: [[1,'January'], [2,'February'], [3,'March'], [4,'April'], [5,'May'], [6,'June']]
      }
    })
    /* END BAR CHART */
    }
    function create_donut_chart() {
       // DONUT CHART
    var donutData = [
      {
        label: 'Series2',
        data : 30,
        color: '#3c8dbc'
      },
      {
        label: 'Series3',
        data : 20,
        color: '#0073b7'
      },
      {
        label: 'Series4',
        data : 50,
        color: '#00c0ef'
      }
    ]
    $.plot('#donut-chart', donutData, {
      series: {
        pie: {
          show       : true,
          radius     : 1,
          innerRadius: 0.5,
          label      : {
            show     : true,
            radius   : 2 / 3,
            formatter: labelFormatter,
            threshold: 0.1
          }

        }
      },
      legend: {
        show: false
      }
    })
     // END DONUT CHART
    }
    function create_line_chart() {

        // LINE CHART
        var sin = [],
            cos = []
        for (var i = 0; i < 14; i += 0.5) {
          sin.push([i, Math.sin(i)])
          cos.push([i, Math.cos(i)])
        }
        var line_data1 = {
          data : sin,
          color: '#3c8dbc'
        }
        var line_data2 = {
          data : cos,
          color: '#00c0ef'
        }
        $.plot('#line-chart', [line_data1, line_data2], {
          grid  : {
            hoverable  : true,
            borderColor: '#f3f3f3',
            borderWidth: 1,
            backgroundColor: '#000000',
            tickColor  : '#f3f3f3'
          },
          series: {
            shadowSize: 0,
            lines     : {
              show: true
            },
            points    : {
              show: true
            }
          },
          lines : {
            fill : false,
            color: ['#3c8dbc', '#f56954']
          },
          yaxis : {
            show: true
          },
          xaxis : {
            show: true
          }
        })
        //Initialize tooltip on hover
        $('<div class="tooltip-inner" id="line-chart-tooltip"></div>').css({
          position: 'absolute',
          display : 'none',
          opacity : 0.8
        }).appendTo('body')
        $('#line-chart').bind('plothover', function (event, pos, item) {

          if (item) {
            var x = item.datapoint[0].toFixed(2),
                y = item.datapoint[1].toFixed(2)

            $('#line-chart-tooltip').html(item.series.label + ' of ' + x + ' = ' + y)
              .css({
                top : item.pageY + 5,
                left: item.pageX + 5
              })
              .fadeIn(200)
          } else {
            $('#line-chart-tooltip').hide()
          }

        })
        /* END LINE CHART */

    }
//    function getRandomData() {
//      if (data.length > 0) {
//        data = data.slice(1)
//      }
//
//      // Do a random walk
//      while (data.length < totalPoints+startTime) {
//
//        var prev = data.length > 0 ? data[data.length - 1] : 50,
//            y    = prev + Math.random() * 10 - 5
//
//        if (y < 0) {
//          y = 0
//        } else if (y > 100) {
//          y = 100
//        }
//
//        data.push(y)
//      }
//
//      // Zip the generated y values with the x values
//      var res = []
//      for (var i = startTime; i < totalPoints+startTime; ++i) {
//        res.push([i, data[i]])
//      }
//
//      startTime = startTime + 1
//
//      console.log(res)
//
//      return chart_data
//    }
       // Custom Label formatter
    function labelFormatter(label, series) {
    return '<div style="font-size:13px; text-align:center; padding:2px; color: #fff; font-weight: 600;">'
      + label
      + '<br>'
      + Math.round(series.percent) + '%</div>'
    }

    $scope.save_point = function() {
            if ($scope.point.type == "UPDATE_EXISTING") {
                    updatePoints($scope.point)
                    var parameters = { params: {point:$scope.point} };
                    //$scope.faults
                    $http.get('/api/save_point', parameters).then(function(response) {
                });
            }

            else if ($scope.point.type == "COPY_FAULT" || $scope.point.type == "NEW_FAULT") {
                    newPoint($scope.point)
                    console.log($scope.point.Comment)
                    var parameters = { params: {point:$scope.point} };
                    $http.get('/api/new_point', parameters).then(function(response) {
                });
            }
    }
    function updatePoints(point) {
       for (var i in $scope.points) {
         if ($scope.points[i].index == point.index) {
            $scope.points[i] = JSON.parse(JSON.stringify(point));
            break;
         }
       }
    }
    function newPoint(point) {
        point.index = $scope.index
        $scope.index = $scope.index + 1
        $scope.points.push(JSON.parse(JSON.stringify(point)));
    }
    $scope.sys_change = function() {
            var parameters = { params: {sys_list:$scope.output_sys_list} };
            $http.get('/api/update_datapoints_sys_list', parameters).then(function(response) {
               $scope.component_list = response.data.comp_list
               $scope.points= response.data.pts_list
        });

    }
    $scope.comp_change = function() {
            var selected_comp_list = []
            var selected_sys_list = []
            angular.forEach( $scope.output_sys_list, function( value, key ) {
                if(value.ticked == true){selected_sys_list.push(value.name)}
           });
           angular.forEach( $scope.output_comp_list, function( value, key ) {
                if(value.ticked == true){selected_comp_list.push(value.name)}
           });
            var parameters = { params: {sys_list:selected_sys_list, comp_list:selected_comp_list} };
            $http.get('/api/update_datapoints_list', parameters).then(function(response) {
            //$scope.tags = response.data.tags
            $scope.points = response.data.pts_list
        });
    }
    $scope.related_symbols_change = function(fault_index, ticked_fault_list) {

        var parameters = { params: {index:fault_index, fault_list:ticked_fault_list} };
        $http.get('/api/update_related', parameters).then(function(response) {
            $scope.tags = response.data.points
        });
    }
     $scope.dependencies_change = function(fault_index, ticked_fault_list) {

        var parameters = { params: {index:fault_index, fault_list:ticked_fault_list} };
        $http.get('/api/update_dependencies', parameters).then(function(response) {
            $scope.tags = response.data.points
        });
    }
    $scope.setSort = function(sort) {
      if ($scope.sort === sort) {
        $scope.reverse = !$scope.reverse;
      }
      if ($scope.sort !== undefined) {
        $scope.sort = sort;
      }
    }
    //save system (create & update)
    $scope.savefault = function(fault, index) {
      if (fault.editMode) {
           var parameters = { params: {fault:fault} };
            $http.get('/api/save_fault', parameters).then(function(response) {

        });


        fault.editMode = false;
     }

    }
    //bulk update tags
    $scope.bulkUpdatetags = function() {
      for (var i = 0; i < $scope.tags.length; i++) {
        var system = $scope.tags[i];
        if (system.editMode) {
          $scope.savetag(system, i);
        }
      }
    }
    $scope.editrow = function(row) {
        $scope.point.index = row.index
        $scope.point.title = "DINE | Edit Point"
        $scope.set_point_values(row, 'UPDATE_EXISTING')
    }
    $scope.copyfault = function(fault) {
         $scope.point.title = "DINE | Copy Point"
         $scope.set_point_values(fault, 'COPY_FAULT')
    }
    $scope.newfault = function() {
         $scope.initialize_point_values()
         $scope.point.title = "DINE | New Point"
         $scope.point.type = 'NEW_FAULT'
         $scope.point.system_list = $scope.system_list.map(({ name }) => name);
         $scope.point.Related_Symbols = JSON.parse(JSON.stringify($scope.points[0].Related_Symbols));
         $scope.point.Dependencies = JSON.parse(JSON.stringify($scope.points[0].Dependencies));
         $('#systemModal').modal();
    }
    $scope.set_point_values = function(fault_, type) {
        $scope.point.System = fault_.System
        $scope.point.system_list = $scope.system_list.map(({ name }) => name);
        $scope.point.Component = fault_.Component
        $scope.point.Type = fault_.Type
        $scope.point.Variable = fault_.Variable
        $scope.point.Name = fault_.Name
        $scope.point.Symbol = fault_.Symbol
        $scope.point.Comment = fault_.Comment
        $scope.point.Value = fault_.Value
        $scope.point.Formula = fault_.Formula
        $scope.point.Related_Symbols = JSON.parse(JSON.stringify(fault_.Related_Symbols));
        $scope.point.Dependencies = JSON.parse(JSON.stringify(fault_.Dependencies));
        $scope.point.Unit = fault_.Unit
        $scope.point.type = type


        $('#systemModal').modal();
    }
    $scope.initialize_point_values = function() {
        $scope.point.System = ''
        $scope.point.system_list = ''
        $scope.point.Component = ''
        $scope.point.Type = ''
        $scope.point.Variable = ''
        $scope.point.Name = ''
        $scope.point.Symbol = ''
        $scope.point.Comment = ''
        $scope.point.Value = null
        $scope.point.Formula = ''
        $scope.point.Related_Symbols = ''
        $scope.point.Dependencies = ''
        $scope.point.Unit = ''
        $scope.point.type = ''
    }
    //cancel
    $scope.cancel = function(system) {
      //getAlltags();
      system.editMode = false;

      //angular.extend(system,lastEditedtag);
    }
    $scope.deletepoint = function(row) {
        $scope.index_to_delete = row.index
        $('#confirmDeleteModal').modal();
    }
    //delete system
$scope.confirmed_delete = function() {
            _index = $scope.index_to_delete
            $scope.index_to_delete = undefined
            for( var i = 0; i < $scope.points.length; i++){
                //ind = $scope.points.index
                if ( $scope.points[i].index == _index) {
                    $scope.points.splice(i, 1);
                    break;
                }
            }
            var parameters = { params: {point:_index} };
            $http.get('/api/delete_point', parameters).then(function(response) {

		});
    }
}]);




