
from flask   import json
#from jinja2  import TemplateNotFound
#from app     import app
from sklearn import metrics
#from . models import User
from app    import app,db,bc
#from . common import *
#from sqlalchemy import desc,or_
#import hashlib
#from flask_mail  import Message
#import re
#from flask       import render_template
import pandas as pd
import random
random.seed(1)
import calendar
from datetime import datetime

#import      os, datetime, time, random

# build a Json response
def response( data ):
    return app.response_class( response=json.dumps(data),
                               status=200,
                               mimetype='application/json' )

def g_db_commit( ):

    db.session.commit( );

def g_db_add( obj ):

    if obj:
        db.session.add ( obj )

def g_db_del( obj ):

    if obj:
        db.session.delete ( obj )

def system_and_component_list():
    query = "SELECT DISTINCT [System_Name] FROM [DINE].[dbo].[components]"
    df = pd.read_sql(query, con=db.engine).sort_values(by='System_Name', ascending=False)
    _list = list(df['System_Name'].values)
    selected_system = "Chillers"
    system_list = [{'name': n, 'ticked': True} if n == selected_system else {'name': n, 'ticked': False} for n in _list]

    query = "SELECT DISTINCT [Component] FROM [DINE].[dbo].[components] WHERE System_Name = '"+selected_system+"'"
    df = pd.read_sql(query, con=db.engine).sort_values(by='Component')
    _list = list(df['Component'].values)
    selected_component = _list[0]
    component_list = [{'name': n, 'ticked': True} if n == selected_component else {'name': n, 'ticked': False} for n in _list]

    query = "SELECT DISTINCT [Component] FROM [DINE].[dbo].[components]"
    df = pd.read_sql(query, con=db.engine).sort_values(by='Component')
    all_components = list(df['Component'].values)

    return system_list, component_list, selected_system, selected_component, all_components





def getComps(selected_system, selected_component):
    all_points = get_all_data_symbols("'"+selected_system+"'")
    df =  get_records('faults', selected_system, selected_component)
    df = create_dropdown_data(df, 'Data_Points', all_points)
    return df


def get_system_deviations(sys):
    query = "SELECT * FROM [DINE].[dbo].[deviations] WHERE system = '%s' " %(sys)
    df = pd.read_sql(query, con=db.engine)
    df['StartTime'] = pd.to_datetime(df['StartTime'], unit='ms')
    df['EndTime'] = pd.to_datetime(df['EndTime'], unit='ms')


    #datetime.fromtimestamp(timestamp)
    print(df)
    return df.to_dict(orient='record')


def getAnalyses(selected_system, selected_component):
    all_points = get_all_data_symbols("'"+selected_system+"'")
    df =  get_records('analyses', selected_system, selected_component)
    df = create_dropdown_data(df, 'Data_Points', all_points)

    types =  get_records('analysis_types', selected_system, selected_component)
    types = list(types['Type'].values)
    #print(types)

    return df, types

def getAnalysesTypes(selected_system, selected_component):
    df =  get_records('analysis_types', selected_system, selected_component)
    return df


def getDataPoints(selected_system, selected_component):

    all_points = get_all_data_symbols("'"+selected_system+"'")

    all_tags = get_all_data_tags("'"+selected_system+"'")

    df = get_records('data_points', selected_system, selected_component)

    df = create_dropdown_data(df, 'Dependencies', all_points)

    df = create_dropdown_data(df, 'Related_Symbols', all_points)

    #print(df)

    df = create_dropdown_data(df, 'Tags', all_tags, name='Alias', maker='Object Description')

    #print(df)

    return df


def getDataPointsList(selected_system, selected_component):
    all_points = get_all_data_symbols(selected_system)
    df = get_records_lists('data_points', selected_system, selected_component)
    df = create_dropdown_data(df, 'Dependencies', all_points)
    df = create_dropdown_data(df, 'Related_Symbols', all_points)
    all_tags = get_all_data_tags(selected_system)
    df = create_dropdown_data(df, 'Tags', all_tags, name='Alias', maker='Object Description')
    return df


def getSystemComponents(sys):
    query = "SELECT DISTINCT [Component] FROM [DINE].[dbo].[components] WHERE System_Name IN (%s)" %(sys)
    df = pd.read_sql(query, con=db.engine).sort_values(by='Component')
    _list = list(df['Component'].values)
    selected_component = _list[0]
    component_list = [{'name': n, 'ticked': True} if n == selected_component else {'name': n, 'ticked': False} for n in _list]
    return component_list, selected_component

def getAnalyticsList(selected_system, selected_component):
    all_points = get_all_data_symbols(selected_system)
    df = get_records_lists('analyses', selected_system, selected_component)
    df = create_dropdown_data(df, 'Data_Points', all_points)
    types =  get_records_lists('analysis_types', selected_system, selected_component)
    types = list(types['Type'].values)

    return df, types


def getAnalyticsTypesList(selected_system, selected_component):
    #all_points = get_all_data_symbols(selected_system)
    df = get_records_lists('analysis_types', selected_system, selected_component)
    #df = create_dropdown_data(df, 'Data_Points', all_points)
    #types =  get_records_lists('analysis_types', selected_system, selected_component)
    #types = list(types['Type'].values)

    return df


def getCompsList(selected_system, selected_component):

    all_points = get_all_data_symbols(selected_system)

    #query = "SELECT * FROM [DINE].[dbo].[faults] WHERE [System_Name] IN (%s) AND [Component] IN (%s)" % (selected_system, selected_component)
    #df = pd.read_sql(query, con=db.engine)

    df = get_records_lists('faults', selected_system, selected_component)

    df = create_dropdown_data(df, 'Data_Points', all_points)

    return df


def get_records(table, system, component):
    query = "SELECT * FROM [DINE].[dbo].[%s] WHERE [System] =  '%s' AND [Component] = '%s'" % (table, system, component)
    return pd.read_sql(query, con=db.engine)


def get_records_lists(table, system, component):
    query = "SELECT * FROM [DINE].[dbo].[%s] WHERE [System] IN (%s) AND [Component] IN (%s)" % (table, system, component)
    #print(query)
    return pd.read_sql(query, con=db.engine)


def get_all_data_symbols(selected_system):
    query = "SELECT [Name], [Symbol] FROM [DINE].[dbo].[data_points] WHERE (System IN (%s) OR System = '%s')" % (selected_system, "Constants")
    df_ = pd.read_sql(query, con=db.engine).sort_values(by='Name')
    all_points = json.loads(df_.to_json(orient='records'))

    return all_points


def get_all_data_tags(selected_system):

    dropped_types = ['FLT', 'HAL', 'LAL', 'TLog', 'Tlog', 'HHAL', 'LLAL', 'ALM']
    accepted_transmitters = ['FIT', 'PIT', 'PDIT', 'YC', 'XI', 'PI', 'TI', 'YI', 'HI', 'II', 'SI', 'JI', 'TT', 'SCR', 'XS', 'DI', 'MI', 'QA']

    query = "SELECT [Equipment_Code] FROM [DINE].[dbo].[systems] WHERE (System_Name IN (%s))" % (selected_system)
    df_ = pd.read_sql(query, con=db.engine)['Equipment_Code'].values
    codes =  "'"+"', '".join(df_)+"'"
    removed = "'" + "', '".join(dropped_types) + "'"
    tx= "'" + "', '".join(accepted_transmitters) + "'"

    #query = "SELECT [Tag], [FLOC_Description] FROM [DINE].[dbo].[flocs] WHERE [Tag] NOT IN (%s)) AND [Transimitter] IN (%s)" % (codes, removed, tx)
    #df_ = pd.read_sql(query, con=db.engine).sort_values(by='Alias')

    query = "SELECT [Alias], [Object Description] FROM [DINE].[dbo].[nqbms] WHERE System IN (%s) AND ([Type] IS NULL OR [Type] NOT IN (%s)) AND [Transimitter] IN (%s)" % (codes, removed, tx)
    df_ = pd.read_sql(query, con=db.engine).sort_values(by='Alias')





    all_points = json.loads(df_.to_json(orient='records'))

    return all_points


def RandomWalk(N=100,_min=0, _max=100, _type='float', pct_movement = 0.05):
    _range = _max - _min
    #pct_movement = 0.05
    random_walk = list()
    if _type == 'float':
        random_walk.append(random.uniform(_min, _max))
    else:
        random_walk.append(random.randint(_min,_max))
    for i in range(1, N):
        movement = random.uniform(-pct_movement*_range, pct_movement*_range)
        value = random_walk[i-1] + movement
        if value < _min:
            value = _min
        if value > _max:
            value = _max
        if _type == 'float':
            random_walk.append(round(value,4))
        else:
            if value < 0.5:
                random_walk.append(0)
            else:
                random_walk.append(1)
    return random_walk


def get_status_data(_start, _end, tags, single_chart=True,grouped_data=None,pad = True,constants=None):

    tags = "'" + "', '".join(tags) + "'"
    query = "SELECT [Tag],[Time],[Value] FROM [DINE].[dbo].[data] WHERE Tag IN (%s) AND [Time] > %s AND [Time] < %s " % (tags, _start, _end)
    df = pd.read_sql(query, con=db.engine).sort_values(by='Time')

    if constants is not None:
        for constant in constants:
            all_dates = df['Time'].unique()
            all_data = list(zip([constant for d in all_dates],all_dates,[constants[constant] for d in all_dates]))
            df_add = pd.DataFrame(all_data, columns=['Tag', 'Time', 'Value'])
        df = pd.concat([df,df_add])
    colours = get_hex_colour_code(len(tags))
    groups = df.groupby(by='Tag')
    data = {}
    i = 0
    for name,group in groups:
        dat = []
        #flow = []
        _d = group[['Time','Value']].values
        for k in range(len(_d)):
            if pad:
                if k > 0:
                    dat.append([int(_d[k][0]), float(_d[k-1][1])])
            dat.append([int(_d[k][0]),float(_d[k][1])])

        data[name] = {'label': name, 'data': dat, 'color': colours[i]}
        i += 1

    data = create_graph_data(data, single_chart, grouped_data,constants)






    return data


def area_under_curve(x_array, y_array):
    # Compute Area Under the Curve (AUC) using the trapezoidal rule
    # x coordinates. These must be either monotonic increasing or monotonic decreasing.
    # https://scikit-learn.org/stable/modules/generated/sklearn.metrics.auc.html
    return metrics.auc(x_array, y_array)


def get_average(df):
    groups = df.groupby(by='Tag')
    flows = []
    for name,group in groups:
        group['Diff'] = group['Time'].diff()
        total_time = group['Diff'].sum()
        zero_time = group[group['Value']==0]['Diff'].sum()
        _time = total_time-zero_time
        area = area_under_curve(group['Time'].values, group['Value'].values)
        flow_rate = round(area/_time,1)
        flows.append(flow_rate)
    average = round(sum(flows) / len(flows), 1)
    return average


def get_stats(_start, _end, _start_previous, tags):

    tags = "'" + "_Average', '".join(tags) + "_Average'"
    query = "SELECT [Value] FROM [DINE].[dbo].[data] WHERE Tag IN (%s) AND [Time] > %s AND [Time] < %s " % (tags, _start, _end)
    df = pd.read_sql(query, con=db.engine)

    #df['Time'] = (df['Time'] - df['Time'].values[0])/1000
    current = round(df['Value'].mean(),1)

    query = "SELECT [Value] FROM [DINE].[dbo].[data] WHERE Tag IN (%s) AND [Time] > %s AND [Time] < %s " % (tags, _start_previous, _start)
    df = pd.read_sql(query, con=db.engine)
    #df['Time'] = (df['Time'] - df['Time'].values[0])/1000
    previous = round(df['Value'].mean(),1)

    pct_change = get_pct_change(current, previous)

    change = get_change_status(current, previous)

    return current, pct_change, change


def get_energy_stats(_start, _end, _start_previous, tags):

    tags = "'" + "', '".join(tags) + "'"
    query = "SELECT [Value] FROM [DINE].[dbo].[data] WHERE Tag IN (%s) AND [Time] > %s AND [Time] <= %s " % (tags, _start, _end)
    df = pd.read_sql(query, con=db.engine)

    #df['Time'] = (df['Time'] - df['Time'].values[0])/1000
    current = round(df['Value'].mean(),1)

    query = "SELECT [Value] FROM [DINE].[dbo].[data] WHERE Tag IN (%s) AND [Time] > %s AND [Time] <= %s " % (tags, _start_previous, _start)
    df = pd.read_sql(query, con=db.engine)
    #df['Time'] = (df['Time'] - df['Time'].values[0])/1000
    previous = round(df['Value'].mean(),1)

    pct_change = get_pct_change(current, previous)

    change = get_change_status(current, previous)

    return current, pct_change, change


def get_energy_data(_start, _end, _start_previous, tags):

    tags = "'" + "', '".join(tags) + "'"
    query = "SELECT [Value] FROM [DINE].[dbo].[data] WHERE Tag IN (%s) AND [Time] > %s AND [Time] < %s " % (tags, _start, _end)
    df = pd.read_sql(query, con=db.engine)
    current = int(df['Value'].sum())


    query = "SELECT [Value] FROM [DINE].[dbo].[data] WHERE Tag IN (%s) AND [Time] > %s AND [Time] < %s " % (tags, _start_previous, _start)
    df = pd.read_sql(query, con=db.engine)
    previous = int(df['Value'].sum())

    pct_change = get_pct_change(current, previous)

    change = get_change_status(current, previous)

    return current, pct_change, change


def get_pct_change(current, previous):
    if previous == 0 and current == 0:
        return 0.0
    if previous ==0 and current != 0:
        return 100.0
    else:
        return round((current - previous) / previous * 100, 1)


def get_change_status(current, previous):
        if current > previous:
            return 'increased'
        if previous > current:
            return 'decreased'
        else:
            return 'constant'


def create_graph_data(data, single_chart, grouped_data,constants):

    new_data = []

    if grouped_data is None:
        for name in data:
            if single_chart:
                if len(new_data) == 0:
                    new_data.append([data[name]])
                else:
                    new_data[0] = new_data[0] + data[name]
            else:
                new_data.append([data[name]])
    else:
        for group in grouped_data:
            sub_group = []
            for name in grouped_data[group]:
                #print(group, name)
                sub_group.append(data[name])
                #if single_chart:
                #    if len(sub_group) == 0:
                #        sub_group.append([data[name]])
                 #   else:
                 #       sub_group[0] = sub_group[0] + data[name]
            new_data.append(sub_group)

    return new_data


def get_hex_colour_code(N=1):
    _list = []
    for i in range(N):
        random_number = random.randint(0, 16777215)
        hex_number = format(random_number, 'x')
        hex_number = '#' + hex_number
        _list.append(hex_number)
    return _list


def delta_RandomWalk(previous,_min=0, _max=100):
    #random.seed(1)
    movement = random.uniform(-5, 5)
    #print(movement)
    value = previous + movement
    if value < _min:
        value = _min
    if value > _max:
        value = _max

    return round(value,4)




def updated_chiller_data(charts_data, _now):
    update = {}
    for chart in charts_data:
        data = json.loads(chart)
        #print(data)
        query = "SELECT [Time],[Value] FROM [DINE].[dbo].[data] WHERE Tag = '%s' AND [Time] > %s AND [Time] <= %s " % (data['tag'],data['last_time'], _now)
        df = pd.read_sql(query, con=db.engine).sort_values(by='Time')
        _d = df[['Time', 'Value']].values
        dat = []
        for k in range(len(_d)):
            if 'B40-XS-' in data['tag']:
                if k > 0:
                    dat.append([int(_d[k][0]), float(_d[k - 1][1])])
            dat.append([int(_d[k][0]), float(_d[k][1])])

        update[data['tag']] = dat

    return update


def create_dropdown_data(df, column, all_points, name='Symbol', maker='Name'):

    points_list = df[column].values
    points = []
    for p in range(len(df)):
        if points_list[p] is None:
            _list = []
        else:
            _list = points_list[p].split(',')
        _dict_list = [{'name':n[name], 'maker':'('+n[maker]+')', 'ticked':True} if n[name] in _list else {'name':n[name], 'maker':'('+n[maker]+')', 'ticked':False} for n in all_points]
        points.append(_dict_list)

    df[column] = points

    return df

