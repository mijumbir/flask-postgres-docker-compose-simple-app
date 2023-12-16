import os
# Flask modules
from flask import render_template, request, url_for, redirect, send_from_directory, jsonify, Response
from flask_login import login_user, logout_user, current_user, login_required
#from werkzeug.exceptions import HTTPException, NotFound, abort
import pandas as pd
import json
import datetime
import calendar

# App modules
from app import app, lm, db, bc
from models import User
from forms import LoginForm, RegisterForm
from util import get_system_deviations, getAnalyticsTypesList, getAnalysesTypes, getSystemComponents, getAnalyticsList, getAnalyses, system_and_component_list, get_energy_stats, get_stats, get_energy_data, getComps, getCompsList,getDataPoints, getDataPointsList, RandomWalk, delta_RandomWalk, get_status_data, updated_chiller_data

version_number = 1
tag_columns = {'Object Description': 'description', 'Main Value': 'value', 'Main Value.Unit': 'unit'}
groups_ = ['GU','HV','EL','R0','RM','TA','TS','TW','FH','SA','VS']


# Provide login manager with load_user callback
@lm.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))


# Logout user
@app.route('/logout.html')
def logout():
    ''' Logout user '''
    logout_user()
    return redirect(url_for('index'))


# Reset Password - Not
@app.route('/reset.html')
def reset():
    ''' Not implemented '''
    return render_template('layouts/auth-default.html',
                           content=render_template('pages/reset.html'))


# Register a new user
@app.route('/register.html', methods=['GET', 'POST'])
def register():
    ''' Create a new user '''
    # declare the Registration Form
    form = RegisterForm(request.form)
    msg = None
    if request.method == 'GET':
        return render_template('layouts/auth-default.html',
                               content=render_template('pages/register.html', form=form, msg=msg))

    # check if both http method is POST and form is valid on submit
    if form.validate_on_submit():
        # assign form data to variables
        username = request.form.get('username', '', type=str)
        password = request.form.get('password', '', type=str)
        email = request.form.get('email', '', type=str)
        print(username, email)
        # filter User out of database through username
        user = User.query.filter_by(user=username).first()
        # filter User out of database through username
        user_by_email = User.query.filter_by(email=email).first()
        if user or user_by_email:
            msg = 'Error: User exists!'

        else:
            pw_hash = password  # bc.generate_password_hash(password)
            user = User(username, email, pw_hash)
            user.save()
            msg = 'User created, please <a href="' + url_for('login') + '">login</a>'

    else:
        msg = 'Input error'

    return render_template('layouts/auth-default.html',
                           content=render_template('pages/register.html', form=form, msg=msg))


# Authenticate user
@app.route('/login.html', methods=['GET', 'POST'])
def login():
    # Declare the login form
    form = LoginForm(request.form)

    # Flask message injected into the page, in case of any errors
    msg = None

    # check if both http method is POST and form is valid on submit
    if form.validate_on_submit():

        # assign form data to variables
        username = request.form.get('username', '', type=str)
        password = request.form.get('password', '', type=str)

        # filter User out of database through username
        user = User.query.filter_by(user=username).first()

        if user:

            # if bc.check_password_hash(user.password, password):
            if user.password == password:
                login_user(user)
                return redirect(url_for('index'))
            else:
                msg = "Wrong password. Please try again."
        else:
            msg = "Unknown user - Please register."

    return render_template('layouts/auth-default.html',
                           content=render_template('pages/login.html', form=form, msg=msg))


# App main route + generic routing
@app.route('/', defaults={'path': 'index.html'})
@app.route('/<path>')
def index(path):
    if not current_user.is_authenticated:
        return redirect(url_for('login'))
    content = None
    try:
        return render_template('/main.html')

        # try to match the pages defined in -> pages/<input file>
    except:
        return render_template('layouts/auth-default.html',content=render_template('pages/error-404.html'))


@app.route('/api/initialise', methods=['GET'])
def initialise_app():

    labelColorTestData = [
        {"label": "person a",
         "times": [{"color": "green", "label": "Weeee", "starting_time": 1355752800000, "ending_time": 1355759900000},
                 {"color": "blue", "label": "Weeee", "starting_time": 1355767900000, "ending_time": 1355774400000}]},
        {"label": "person b",
         "times": [{"color": "pink", "label": "Weeee", "starting_time": 1355759910000, "ending_time": 1355761900000}, ]},
        {"label": "person c",
         "times": [{"color": "yellow", "label": "Weeee", "starting_time": 1355761910000, "ending_time": 1355763910000}]}
    ]

    print('HERERERE')

    # query = "SELECT [Equipment_Code],[Equipment_Name],[System_Code],[System_Name],[Building] FROM [DINE].[dbo].[systems]"
    # df = pd.read_sql(query, con=db.engine)
    # df["key"] = df["Equipment_Name"] + "(" + df["Equipment_Code"] + ")"
    # df["system"] = df["System_Name"] + "(" + df["System_Code"] + ")"
    #
    # #count_query = "SELECT [System] FROM [DINE].[dbo].[nqbms] WHERE [System] IS NOT NULL AND Type <> 'TLog' AND Type <> 'ALM' AND Type <> 'FLT'"
    # count_query = "SELECT [System] FROM [DINE].[dbo].[nqbms] WHERE [Main Value.Unit] IS NOT NULL AND [Main Value.Unit] <> '' "
    # count_df = pd.read_sql(count_query, con=db.engine)['System'].value_counts()
    # count_df = pd.DataFrame(count_df.reset_index())
    # count_df.columns = ['System', 'value']
    # #print(count_df)
    #
    # df = df.merge(count_df, left_on='Equipment_Code', right_on='System', how='left')
    # df['value'] = df['value'].fillna(0).astype(int)
    #
    # data = df.to_json(orient='records')

    return labelColorTestData


@app.route('/api/systems_flocs', methods=['GET'])
def initialise_systems_flocs():

    query = "SELECT [Area],[System_Name],[Equipment_Sub_Type],[Equipment_Type],[Equipment_Name],[Equipment_Code] FROM [DINE].[dbo].[flocs] WHERE [Tag] IS NOT NULL AND [Tag] <> ''"
    df = pd.read_sql(query, con=db.engine)
    #df["key"] = df["Equipment_Sub_Type"]
    df["key"] = df["Equipment_Name"]+ " [" + df["Equipment_Code"] + "]"
    df["system"] = df["Equipment_Type"]
    df["System_Name"] = df["System_Name"]
    df["Area"] = df["Area"]

    count_query = "SELECT [Equipment_Name] FROM [DINE].[dbo].[flocs]  WHERE [Tag] IS NOT NULL AND [Tag] <> ''"
    count_df = pd.read_sql(count_query, con=db.engine)['Equipment_Name'].value_counts()



    count_df = pd.DataFrame(count_df.reset_index())
    count_df.columns = ['Equip', 'value']

    df = df.merge(count_df, left_on='Equipment_Name', right_on='Equip', how='left')
    df.drop_duplicates(subset=['Equipment_Name'], inplace=True)
    df['value'] = df['value'].fillna(0).astype(int)

    data = df.to_json(orient='records')

    return data



@app.route('/api/all_faults', methods=['GET'])
def all_faults_list():

    system_list, component_list, selected_system, selected_component, all_components = system_and_component_list()

    query = "SELECT [index] FROM [DINE].[dbo].[faults]"
    index = int(pd.read_sql(query, con=db.engine)['index'].max()+1)

    df = getComps(selected_system, selected_component)

    sys_list = json.loads(df.to_json(orient='records'))

    return jsonify({'sys_list':sys_list, 'component_list':component_list, 'system_list':system_list, 'index':index, 'all_components':all_components})


@app.route('/api/all_analyses', methods=['GET'])
def all_analyses():

    system_list, component_list, selected_system, selected_component, all_components = system_and_component_list()

    query = "SELECT [index] FROM [DINE].[dbo].[analyses]"

    index = int(pd.read_sql(query, con=db.engine)['index'].max()+1)

    df, types = getAnalyses(selected_system, selected_component)

    sys_list = json.loads(df.to_json(orient='records'))

    #analyses_types =

    return jsonify({'analysis_types':types, 'sys_list':sys_list, 'component_list':component_list, 'system_list':system_list, 'index':index, 'all_components':all_components})



@app.route('/api/all_analyses_types', methods=['GET'])
def all_analyses_types():

    system_list, component_list, selected_system, selected_component, all_components = system_and_component_list()

    query = "SELECT [index] FROM [DINE].[dbo].[analysis_types]"

    index = int(pd.read_sql(query, con=db.engine)['index'].max()+1)

    df = getAnalysesTypes(selected_system, selected_component)

    sys_list = json.loads(df.to_json(orient='records'))

    return jsonify({'sys_list':sys_list, 'component_list':component_list, 'system_list':system_list, 'index':index, 'all_components':all_components})





@app.route('/api/all_datapoints', methods=['GET'])
def all_datapoints():

    system_list, component_list, selected_system, selected_component, all_components = system_and_component_list()

    query = "SELECT [index] FROM [DINE].[dbo].[data_points]"
    index = int(pd.read_sql(query, con=db.engine)['index'].max()+1)

    df = getDataPoints(selected_system, selected_component)

    pt_list = json.loads(df.to_json(orient='records'))

    return jsonify({'pt_list':pt_list, 'component_list':component_list, 'system_list':system_list, 'index':index, 'all_components':all_components})


@app.route('/api/initial_chart_data', methods=['GET'])
def initial_chart_data():

    system_list, component_list, selected_system, selected_component, all_components = system_and_component_list()

    query = "SELECT [index] FROM [DINE].[dbo].[data_points]"
    index = int(pd.read_sql(query, con=db.engine)['index'].max()+1)

    df = getDataPoints(selected_system, selected_component)

    pt_list = json.loads(df.to_json(orient='records'))


    number_of_points = 200
    _now = calendar.timegm(datetime.datetime.now().timetuple()) * 1000
    time_delta = 5000
    _start = _now - time_delta*number_of_points
    data = RandomWalk(N=number_of_points)
    data_2 =  RandomWalk(N=number_of_points)
    chart_data = [[_start+i*time_delta,data[i]] for i in range(len(data))]
    chart_data_2 = [[_start + i * time_delta, data_2[i]] for i in range(len(data_2))]
    chart_data_3 = [[_start + i * time_delta, 75] for i in range(len(data_2))]


    _end = calendar.timegm(datetime.datetime.now().timetuple()) * 1000
    _start = _end - 7*24*60*60*1000
    chiller_status_tags = ['B40-XS-8210A-001', 'B40-XS-8210B-001', 'B40-XS-8210C-001', 'B40-XS-8210D-001']
    status_data = get_status_data(_start, _end, chiller_status_tags,single_chart=False)

    chiller_flow_tags = ['B40-FT-8210A-002', 'B40-FT-8210B-002', 'B40-FT-8210C-002', 'B40-FT-8210D-002']
    flow_data = get_status_data(_start, _end, chiller_flow_tags,single_chart=False)


    chiller_pct_load_tags = ['8210A-PCTLoad', '8210B-PCTLoad', '8210C-PCTLoad', '8210D-PCTLoad']
    load_data = get_status_data(_start, _end, chiller_pct_load_tags,single_chart=False)

    chiller_temp = ['B40-TT-8210A-001', 'B40-TT-8210B-001', 'B40-TT-8210C-001', 'B40-TT-8210D-001', 'B40-TT-8210A-003', 'B40-TT-8210B-003', 'B40-TT-8210C-003', 'B40-TT-8210D-003']
    groups = {'Chiller A':['B40-TT-8210A-001', 'B40-TT-8210A-003'], 'Chiller B':['B40-TT-8210B-001', 'B40-TT-8210B-003'], 'Chiller C':['B40-TT-8210C-001', 'B40-TT-8210C-003'], 'Chiller D':['B40-TT-8210D-001', 'B40-TT-8210D-003'], }
    temp = get_status_data(_start, _end, chiller_temp,False, groups)


    chiller_energy = ['B40-FT-8210A-002-D', 'B40-FT-8210A-001-D', 'B40-FT-8210B-002-D', 'B40-FT-8210B-001-D', 'B40-FT-8210C-002-D', 'B40-FT-8210C-001-D', 'B40-FT-8210D-002-D', 'B40-FT-8210D-001-D']
    groups = {'Chiller A':['B40-FT-8210A-001-D', 'B40-FT-8210A-002-D'], 'Chiller B':['B40-FT-8210B-001-D', 'B40-FT-8210B-002-D'], 'Chiller C':['B40-FT-8210C-001-D', 'B40-FT-8210C-002-D'], 'Chiller D':['B40-FT-8210D-001-D', 'B40-FT-8210D-002-D'], }
    energy = get_status_data(_start, _end, chiller_energy,False, groups)


    return jsonify({'load_data':load_data,'energy':energy, 'temp':temp, 'flow_data':flow_data,'status_data':status_data,'chart': chart_data, 'chart_2': chart_data_2, 'chart_3': chart_data_3,'pt_list':pt_list, 'component_list':component_list, 'system_list':system_list, 'index':index, 'all_components':all_components})


@app.route('/api/initial_analytics_data', methods=['GET'])
def initial_analytics_data():

    system_list, component_list, selected_system, selected_component, all_components = system_and_component_list()

    query = "SELECT [index] FROM [DINE].[dbo].[data_points]"
    index = int(pd.read_sql(query, con=db.engine)['index'].max()+1)

    df = getDataPoints(selected_system, selected_component)

    pt_list = json.loads(df.to_json(orient='records'))


    _end = calendar.timegm(datetime.datetime.now().timetuple()) * 1000
    _start = _end - 7*24*60*60*1000

    chiller_cop_tags = ['8210A-CoP', '8210B-CoP', '8210C-CoP', '8210D-CoP']
    groups =  {'Chiller A':['8210A-CoP', 'Rated-CoP'], 'Chiller B':['8210A-CoP', 'Rated-CoP'], 'Chiller C':['8210A-CoP', 'Rated-CoP'], 'Chiller D':['8210A-CoP', 'Rated-CoP'], }
    constants = {'Rated-CoP':6.15}
    cop_data = get_status_data(_start, _end, chiller_cop_tags,grouped_data=groups,single_chart=False,constants=constants)


    deviations = get_system_deviations(selected_system)


    return jsonify({'deviations':deviations,'cop_data':cop_data,'pt_list':pt_list, 'component_list':component_list, 'system_list':system_list, 'index':index, 'all_components':all_components})


@app.route('/api/initialize_summary', methods=['GET'])
def initialize_summary():

    #print(datetime.datetime.today())

    _end = calendar.timegm(datetime.datetime.today().timetuple()) * 1000
    _start = _end - 24*60*60*1000
    _start_previous = _start - 24 * 60 * 60 * 1000

    chiller_energy = ['B40-FT-8210A-002-D', 'B40-FT-8210A-001-D', 'B40-FT-8210B-002-D', 'B40-FT-8210B-001-D', 'B40-FT-8210C-002-D', 'B40-FT-8210C-001-D', 'B40-FT-8210D-002-D', 'B40-FT-8210D-001-D']
    chiller_flow_tags = ['B40-FT-8210A-002', 'B40-FT-8210B-002', 'B40-FT-8210C-002', 'B40-FT-8210D-002']
    cooling_temp_tags = ['B40-TT-8210A-001', 'B40-TT-8210B-001', 'B40-TT-8210C-001', 'B40-TT-8210D-001']
    chilled_temp_tags = ['B40-TT-8210A-003', 'B40-TT-8210B-003', 'B40-TT-8210C-003', 'B40-TT-8210D-003']
    chiller_kwperton = ['8210A-kWperTon', '8210B-kWperTon', '8210C-kWperTon', '8210D-kWperTon']
    chiller_cop = ['8210A-CoP', '8210B-CoP', '8210C-CoP', '8210D-CoP']

    current, pct_change, direction = get_energy_data(_start, _end, _start_previous, chiller_energy)

    current_flow, pct_flow, flow_direction = get_stats(_start, _end, _start_previous, chiller_flow_tags)

    current_cooling, pct_cooling, cooling_direction = get_stats(_start, _end, _start_previous, cooling_temp_tags)

    current_chilled, pct_chilled, chilled_direction = get_stats(_start, _end, _start_previous, chilled_temp_tags)

    current_cop, pct_cop, cop_direction = get_energy_stats(_start, _end, _start_previous, chiller_cop)

    current_kwton, pct_kwton, kwton_direction = get_energy_stats(_start, _end, _start_previous, chiller_kwperton)


    return jsonify({'current_kwton':current_kwton, 'pct_kwton':pct_kwton, 'kwton_direction':kwton_direction,'current_cop':current_cop, 'pct_cop':pct_cop, 'cop_direction':cop_direction,'current_chilled':current_chilled, 'pct_chilled':pct_chilled, 'chilled_direction':chilled_direction, 'current_cooling':current_cooling, 'pct_cooling':pct_cooling, 'cooling_direction':cooling_direction, 'energy':current, 'energy_change':pct_change, 'direction':direction, 'current_flow':current_flow, 'pct_flow':pct_flow, 'flow_direction':flow_direction})


@app.route('/api/update_chillers_data', methods=['GET'])
def update_chillers_data():

    _now = calendar.timegm(datetime.datetime.now().timetuple()) * 1000

    charts_data = request.args.getlist('charts')

    new_data = updated_chiller_data(charts_data, _now)

    return jsonify({'update': new_data})


@app.route('/api/update_chart_data', methods=['GET'])
def update_chart_data():

    last_point = request.args.getlist('chart')
    last_point_2 = request.args.getlist('chart_2')

    #print(last_point)

    _ind = int(last_point[0])
    val = float(last_point[1])

    _ind_2 = int(last_point_2[0])
    val_2 = float(last_point_2[1])

    #print(val)

    data = delta_RandomWalk(val)
    data_2 = delta_RandomWalk(val_2)

    _now = calendar.timegm(datetime.datetime.now().timetuple()) * 1000

    #print(datetime.datetime.now())

    #print(calendar.timegm(datetime.datetime.now().timetuple()) * 1000)

    return jsonify({'chart': [_now, data], 'chart_2': [_now, data_2], 'chart_3': [_now, 75]})


@app.route('/api/all_tags', methods=['GET'])
def all_tags_list():

    query = "SELECT DISTINCT  [Designation_Plt]\
     FROM [DINE].[dbo].[nqbms] WHERE [Main Value.Unit] IS NOT NULL AND [Main Value.Unit] <> '' AND [Designation_group] IN ('GU','HV','EL','R0','RM','TA','TS','TW','FH','SA','VS')"
    df = pd.read_sql(query, con=db.engine).sort_values(by='Designation_Plt')
    _list = list(df.rename(columns=tag_columns)['Designation_Plt'].values)
    selected_plt = _list[0]
    plt_list = [{'name':n,'ticked':True} if n == selected_plt else {'name':n,'ticked':False} for n in _list]
    #plt_list.append('ALL')



    query = "SELECT DISTINCT  [Designation_Sys]\
     FROM [DINE].[dbo].[nqbms] WHERE [Main Value.Unit] IS NOT NULL AND [Main Value.Unit] <> '' AND [Designation_group] IN ('GU','HV','EL','R0','RM','TA','TS','TW','FH','SA','VS') AND Designation_Plt = '"+selected_plt+"'"
    df = pd.read_sql(query, con=db.engine).sort_values(by='Designation_Sys')
    _list = list(df.rename(columns=tag_columns)['Designation_Sys'].values)
    #system_list.append('ALL')
    selected_system = _list[0]
    system_list = [{'name': n, 'ticked': True} if n == selected_system else {'name': n, 'ticked': False} for n in _list]


    query = "SELECT [index], [Alias],[Object Description],[Main Value],[Main Value.Unit]\
     FROM [DINE].[dbo].[nqbms] WHERE [Main Value.Unit] IS NOT NULL AND [Main Value.Unit] <> '' AND [Designation_group] IN ('GU','HV','EL','R0','RM','TA','TS','TW','FH','SA','VS') AND Designation_Plt = '"+selected_plt+"' AND Designation_Sys = '"+selected_system+"'"
    df = pd.read_sql(query, con=db.engine)
    df = df.rename(columns=tag_columns)

    #print(df)



   # exit()

    # sys = df[['Designation_Plt', 'Designation_Sys']]
    # sys = sys.set_index('Designation_Sys')
    # sys = sys.groupby(by='Designation_Plt').groups
    # systems = {}
    # #system_list
    # for k in sys:
    #     systems[k] = list(set(sys[k]))
    #
    #
    # selected_system = '30Plt104'
    # #system_list =
    # systems_list = systems[selected_system]
    # df = df[df['Designation_Plt'] == selected_system]

    # print(selected_system)
    # print(system_list)
    # print(selected_plt)
    # print(plt_list)

    tags = json.loads(df.to_json(orient='records'))

    return jsonify({'tags': tags, 'search': {}, 'system_list':system_list, 'plt_list':plt_list})


@app.route('/api/all_systems', methods=['GET'])
def all_systems_list():

    query = "SELECT * FROM [DINE].[dbo].[systems]"
    df = pd.read_sql(query, con=db.engine)
    system_list = json.loads(df.to_json(orient='records'))

    return jsonify({'system_list':system_list})


@app.route('/api/update_plt_list', methods=['GET'])
def update_plt_list():

    sys = "'"+"', '".join(request.args.getlist('sys_list'))+"'"
    plt = "'"+"', '".join(request.args.getlist('plt_list'))+"'"
    groups = "('GU','HV','EL','R0','RM','TA','TS','TW','FH','SA','VS')"

    query = "SELECT [index], [Alias],[Object Description],[Main Value],[Main Value.Unit]\
     FROM [DINE].[dbo].[nqbms] WHERE [Main Value.Unit] IS NOT NULL AND [Main Value.Unit] <> '' AND [Designation_group] IN %s AND Designation_Plt IN (%s) AND Designation_Sys IN (%s)" %(groups, plt, sys)
    df = pd.read_sql(query, con=db.engine)
    df = df.rename(columns=tag_columns)

    tags = json.loads(df.to_json(orient='records'))

    return {'tags': tags}


@app.route('/api/update_comp_list', methods=['GET'])
def update_comp_list():

    sys = "'"+"', '".join(request.args.getlist('sys_list'))+"'"
    #comp = "'"+"', '".join(request.args.getlist('comp_list'))+"', 'System'"
    comp = "'" + "', '".join(request.args.getlist('comp_list')) + "'"

    df = getCompsList(sys, comp)

    sys_list = json.loads(df.to_json(orient='records'))

    return jsonify({'sys_list':sys_list})


@app.route('/api/update_datapoints_list', methods=['GET'])
def update_datapoints_list():
    sys = "'"+"', '".join(request.args.getlist('sys_list'))+"'"
    comp = "'"+"', '".join(request.args.getlist('comp_list'))+"'"
    df = getDataPointsList(sys, comp)
    pts_list = json.loads(df.to_json(orient='records'))
    return jsonify({'pts_list':pts_list})


@app.route('/api/update_analysis_list', methods=['GET'])
def update_analysis_list():
    sys = "'"+"', '".join(request.args.getlist('sys_list'))+"'"
    comp = "'"+"', '".join(request.args.getlist('comp_list'))+"'"
    df, types = getAnalyticsList(sys, comp)
    pts_list = json.loads(df.to_json(orient='records'))
    return jsonify({'pts_list':pts_list,'analyses_types':types})


@app.route('/api/update_analysis_types_list', methods=['GET'])
def update_analysis_types_list():
    sys = "'"+"', '".join(request.args.getlist('sys_list'))+"'"
    comp = "'"+"', '".join(request.args.getlist('comp_list'))+"'"
    df = getAnalyticsTypesList(sys, comp)
    pts_list = json.loads(df.to_json(orient='records'))
    return jsonify({'pts_list':pts_list})


@app.route('/api/save_point', methods=['GET'])
def save_point():

    fault = json.loads(request.args.get('point'))

    if (fault['Value'] is None) or (fault['Value'] == ''):
        fault['Value'] = 'NULL'

    #_list = [k['name'] for k in fault['Data_Points_output']]
    #Data_Points = ",".join(_list)

    _list = [k['name'] for k in fault['Related_Symbols_output']]
    Related_Symbols = ",".join(_list)

    _list = [k['name'] for k in fault['Dependencies_output']]
    Dependencies = ",".join(_list)

    _list = [k['name'] for k in fault['Tags_output']]
    Tags = ",".join(_list)

    query = "UPDATE data_points SET Comment='%s', Value=%s, Related_Symbols='%s', Tags='%s', Dependencies='%s', Formula='%s', System='%s', Component='%s', Name='%s', Symbol='%s', Unit='%s', Type='%s', Variable='%s', New_Tag='%s' WHERE [index] = %s"%(fault['Comment'], fault['Value'], Related_Symbols, Tags, Dependencies,fault['Formula'],fault['System'], fault['Component'],fault['Name'],fault['Symbol'],fault['Unit'],fault['Type'],fault['Variable'],fault['New_Tag'],str(fault['index']))

    db.engine.execute(query)

    return Response('Field added successfully.', 200)


@app.route('/api/save_analysis_point', methods=['GET'])
def save_analysis_point():

    fault = json.loads(request.args.get('point'))

    _list = [k['name'] for k in fault['Data_Points_output']]
    Data_Points = ",".join(_list)

    query = "UPDATE analyses SET Data_Points = '%s', Name = '%s', Type = '%s', Fault = '%s', System = '%s', Component = '%s' WHERE [index] = %s"%(Data_Points, fault['Name'], fault['Type'], fault['Fault'], fault['System'], fault['Component'], str(fault['index']))
    db.engine.execute(query)

    return Response('Field added successfully.', 200)



@app.route('/api/save_analysis_type_point', methods=['GET'])
def save_analysis_type_point():

    fault = json.loads(request.args.get('point'))
    query = "UPDATE analysis_types SET Type = '%s', Description = '%s', Inputs = '%s', Outputs = '%s', System = '%s', Component = '%s' WHERE [index] = %s"%(fault['Type'], fault['Description'], fault['Inputs'], fault['Outputs'],fault['System'], fault['Component'], str(fault['index']))
    db.engine.execute(query)

    return Response('Field added successfully.', 200)



@app.route('/api/new_analyses_point', methods=['GET'])
def new_analyses_point():

    fault = json.loads(request.args.get('point'))

    _list = [k['name'] for k in fault['Data_Points_output']]
    Data_Points = ",".join(_list)

    query = "INSERT INTO analyses (Data_Points, Name, Type, Fault, System, Component, [index]) VALUES ('%s', '%s', '%s', '%s', '%s', '%s', %s)" % (Data_Points, fault['Name'], fault['Type'], fault['Fault'],fault['System'], fault['Component'], str(fault['index']))

    db.engine.execute(query)

    return Response('Field added successfully.', 200)



@app.route('/api/new_analyses_type_point', methods=['GET'])
def new_analyses_type_point():
    fault = json.loads(request.args.get('point'))
    query = "INSERT INTO analysis_types (Type, Description, Inputs, Outputs, System, Component, [index]) VALUES ('%s', '%s', '%s', '%s', '%s', '%s', %s)" % (fault['Type'], fault['Description'], fault['Inputs'],fault['Outputs'],fault['System'], fault['Component'], str(fault['index']))
    db.engine.execute(query)
    return Response('Field added successfully.', 200)



@app.route('/api/new_point', methods=['GET'])
def new_point():

    fault = json.loads(request.args.get('point'))

    if (fault['Value'] is None) or (fault['Value'] == ''):
        fault['Value'] = 'NULL'

    _list = [k['name'] for k in fault['Related_Symbols_output']]
    Related_Symbols = ",".join(_list)

    _list = [k['name'] for k in fault['Dependencies_output']]
    Dependencies = ",".join(_list)

    _list = [k['name'] for k in fault['Tags_output']]
    Tags = ",".join(_list)

    query = "INSERT INTO data_points (Comment, Value, Related_Symbols, Tags, Dependencies, Formula, System, Component, Name, Symbol, Unit, Type, Variable, New_Tag, [index]) VALUES ('%s', %s, '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', %s)" % (fault['Comment'],fault['Value'],Related_Symbols, Tags, Dependencies, fault['Formula'], fault['System'], fault['Component'], fault['Name'], fault['Symbol'], fault['Unit'], fault['Type'], fault['Variable'], fault['New_Tag'], str(fault['index']))

    db.engine.execute(query)

    return Response('Field added successfully.', 200)


@app.route('/api/delete_point', methods=['GET'])
def delete_point():
    index = request.args.get('point')
    query = "DELETE FROM data_points WHERE [index] = %s"%(str(index))
    db.engine.execute(query)
    return Response('Field added successfully.', 200)


@app.route('/api/delete_analyses_point', methods=['GET'])
def delete_analyses_point():
    index = request.args.get('point')
    query = "DELETE FROM analyses WHERE [index] = %s"%(str(index))
    db.engine.execute(query)
    return Response('Field added successfully.', 200)


@app.route('/api/delete_analysis_type_point', methods=['GET'])
def delete_analysis_type_point():
    index = request.args.get('point')
    query = "DELETE FROM analysis_types WHERE [index] = %s"%(str(index))
    db.engine.execute(query)
    return Response('Field added successfully.', 200)



@app.route('/api/delete_fault', methods=['GET'])
def delete_fault():
    index = request.args.get('fault')
    query = "DELETE FROM faults WHERE [index] = %s"%(str(index))
    db.engine.execute(query)
    return Response('Field added successfully.', 200)


@app.route('/api/save_fault', methods=['GET'])
def save_fault():

    fault = json.loads(request.args.get('fault'))

    _list = [k['name'] for k in fault['data_points_output']]
    data_points = ",".join(_list)
    #print(data_points)

    query = "UPDATE faults SET Fault = '%s', Comments = '%s', Causes = '%s', Importance = '%s', Data_Points = '%s', Component = '%s', System_Name = '%s' WHERE [index] = '%s'"%(fault['Fault'], fault['Comments'], fault['Causes'], fault['Importance'], data_points, fault['component'], fault['system'], str(fault['index']))
    db.engine.execute(query)

    return Response('Field added successfully.', 200)


@app.route('/api/new_fault', methods=['GET'])
def new_fault():

    fault = json.loads(request.args.get('fault'))

    _list = [k['name'] for k in fault['data_points_output']]
    data_points = ",".join(_list)

    query = "INSERT INTO faults (System_Name, Component, Fault, Comments, Causes, Importance, Data_Points, [index]) VALUES ('%s', '%s', '%s', '%s', '%s', '%s', '%s', %s)" % (fault['system'], fault['component'], fault['Fault'], fault['Comments'], fault['Causes'], fault['Importance'], data_points, str(fault['index']))
    db.engine.execute(query)

    #print("DONE!!!")

    return Response('New Fault Saved successfully.', 200)


@app.route('/api/update_sys_list', methods=['GET'])
def update_sys_list():
    _list = request.args.getlist('plt_list')
    _l = [json.loads(k)['name'] for k in _list]
    plt = "'"+"', '".join(_l)+"'"
    groups = "('GU','HV','EL','R0','RM','TA','TS','TW','FH','SA','VS')"

    query = "SELECT DISTINCT  [Designation_Sys]\
     FROM [DINE].[dbo].[nqbms] WHERE [Main Value.Unit] IS NOT NULL AND [Main Value.Unit] <> '' AND [Designation_group] IN %s AND Designation_Plt IN (%s)" %(groups, plt)
    df = pd.read_sql(query, con=db.engine).sort_values(by='Designation_Sys')
    _list = list(df.rename(columns=tag_columns)['Designation_Sys'].values)

    selected_system = _list[0]
    system_list = [{'name': n, 'ticked': True} if n == selected_system else {'name': n, 'ticked': False} for n in _list]
    #print(system_list)
    return jsonify({'sys_list': system_list})


@app.route('/api/update_fault_sys_list', methods=['GET'])
def update_fault_sys_list():
    _list = request.args.getlist('sys_list')
    #print(_list)
    _l = [json.loads(k)['name'] for k in _list]
    sys = "'"+"', '".join(_l)+"'"

    query = "SELECT DISTINCT [Component] FROM [DINE].[dbo].[components] WHERE System_Name IN (%s)" %(sys)
    df = pd.read_sql(query, con=db.engine).sort_values(by='Component')
    _list = list(df['Component'].values)
    selected_component = _list[0]
    component_list = [{'name': n, 'ticked': True} if n == selected_component else {'name': n, 'ticked': False} for n in
                      _list]

    df = getCompsList(sys, "'"+selected_component+"'")

    fault_list = json.loads(df.to_json(orient='records'))

    return jsonify({'fault_list': fault_list, 'comp_list': component_list})


@app.route('/api/update_datapoints_sys_list', methods=['GET'])
def update_datapoints_sys_list():

    _list = request.args.getlist('sys_list')
    _l = [json.loads(k)['name'] for k in _list]
    sys = "'"+"', '".join(_l)+"'"

    component_list, selected_component = getSystemComponents(sys)
    df = getDataPointsList(sys, "'"+selected_component+"'")
    pts_list = json.loads(df.to_json(orient='records'))
    return jsonify({'pts_list': pts_list, 'comp_list': component_list})


@app.route('/api/get_component_list', methods=['GET'])
def get_component_list():
    _list = request.args.getlist('sys_list')
    _l = [json.loads(k)['name'] for k in _list]
    sys = "'"+"', '".join(_l)+"'"
    component_list, selected_component = getSystemComponents(sys)
    return jsonify({'comp_list': component_list})


@app.route('/api/table', methods=['GET'])
def initialise_table():

    users = [{'firstName': 'k1', 'lastName': 'l1', 'email':'e1'}, {'firstName': 'k2', 'lastName': 'l2', 'email':'e2'}, {'firstName': 'k3', 'lastName': 'l3', 'email':'e3'}]
    search = {'firstName': 'k', 'lastName': 'l', 'email':'e'}

    return jsonify({'users':users, 'search':search})


@app.route('/tags')
def tags():

    print(request.args['data'])

    return render_template('/tags.html', version_number=version_number)


@app.route('/api/get_system_details', methods=['GET'])
def get_system_details():

    #return render_template('/tags.html', version_number=version_number)

    details = request.args.get('details')

    #print(details)

    code = details.split('/')[-1].split('(')[-2].replace(')', '').replace(' ', '')

    query = "SELECT [index], [Alias],[Object Description],[Main Value],[Main Value.Unit]\
    FROM [DINE].[dbo].[nqbms] WHERE [Main Value.Unit] IS NOT NULL AND [Main Value.Unit] <> '' AND System = '"+code+"'"

    #print(query)

    df = pd.read_sql(query, con=db.engine)
    df = df.rename(columns=tag_columns)

    #print(df)

    tags = json.loads(df.to_json(orient='records'))
    #print(json.loads(tags)[0])

    #exit()
    #tags_ = [t for t in tags]
    search = {'Alias':''}

    #data = {'data': "test"}
    ##return redirect(url_for('tags'), message={'data': "test"})
    #return render_template('/tags.html', version_number=version_number)

    return jsonify({'tags':tags, 'search':search})

    #print(df)

    #return ({"data":3}, 200)

    # if db.settings.find (pronto_field).count () > 0 is True:
    #     return Response(data['pronto_field'] + ' is already in the database.', 400)
    #
    # else:
    #     db.settings.insert (pronto_field)
    #     return Response('Field added successfully.', 200)


@app.route('/api/get_system_details_flocs', methods=['GET'])
def get_system_details_flocs():

    details = request.args.get('details')

    code = details.split(' / ')
    _len = len(code)
    code = code[-1].split(' (')[-2]

    if _len == 2:
        column = 'Area'
    elif _len == 3:
        column = 'System_Name'
    elif _len == 4:
        column = 'Equipment_Type'
    elif _len == 5:
        code = code.split(' [')[-2]
        column = 'Equipment_Name'
    else:
        column = 'Equipment_Sub_Type'

    query = "SELECT * FROM [DINE].[dbo].[flocs] WHERE [%s] = '%s' AND [Tag] IS NOT NULL AND [Tag] <> ''" % (column, code)

    df = pd.read_sql(query, con=db.engine)
    df = df.rename(columns=tag_columns)

    tags = json.loads(df.to_json(orient='records'))
    search = {'Tag':''}

    return jsonify({'tags':tags, 'search':search})


@app.route('/api/update_tag', methods=['GET'])
def update_tag():

    details = json.loads(request.args.get('details'))

    str_ = "[Object Description] = '"+details['description']+"', [Main Value.Unit] = '"+details['unit']+"', [Alias] = '"+details['Alias']+"'"

    query = "UPDATE nqbms SET " +str_+" WHERE [index] = "+str(details['index'])

    db.engine.execute(query)

    return Response('Tag updated successfully.', 200)


@app.route('/api/update_fault', methods=['GET'])
def update_fault():

    index = request.args.get('index')
    _list = [json.loads(k)['name'] for k in request.args.getlist('fault_list')]
    faults = ",".join(_list)

    query = "UPDATE faults SET [Data_Points] = '%s' WHERE [index] = '%s'"%(faults, str(index))

    db.engine.execute(query)

    return Response('Fault updated successfully.', 200)


@app.route('/api/update_related', methods=['GET'])
def update_related():

    index = request.args.get('index')
    _list = [json.loads(k)['name'] for k in request.args.getlist('fault_list')]
    faults = ",".join(_list)

    query = "UPDATE data_points SET [Related_Symbols] = '%s' WHERE [index] = '%s'"%(faults, str(index))

    db.engine.execute(query)

    return Response('Fault updated successfully.', 200)


@app.route('/api/update_analyses_data_points', methods=['GET'])
def update_analyses_data_points():

    index = request.args.get('index')
    _list = [json.loads(k)['name'] for k in request.args.getlist('fault_list')]
    faults = ",".join(_list)

    query = "UPDATE analyses SET [Data_Points] = '%s' WHERE [index] = '%s'"%(faults, str(index))

    db.engine.execute(query)

    return Response('Fault updated successfully.', 200)


@app.route('/api/update_dependencies', methods=['GET'])
def update_dependencies():

    index = request.args.get('index')
    _list = [json.loads(k)['name'] for k in request.args.getlist('fault_list')]
    faults = ",".join(_list)

    query = "UPDATE data_points SET [Dependencies] = '%s' WHERE [index] = '%s'"%(faults, str(index))

    db.engine.execute(query)

    return Response('Fault updated successfully.', 200)


@app.route('/api/update_tags', methods=['GET'])
def update_tags():

    index = request.args.get('index')
    _list = [json.loads(k)['name'] for k in request.args.getlist('fault_list')]
    faults = ",".join(_list)

    query = "UPDATE data_points SET [Tags] = '%s' WHERE [index] = '%s'"%(faults, str(index))

    db.engine.execute(query)

    return Response('Fault updated successfully.', 200)


@app.route('/dashboard')
def dashboard():
    # Redirect to login page if user is not logged in.
    if not current_user.is_authenticated:
        return redirect(url_for('login'))

    return render_template('/index.html', version_number=version_number)


@app.route('/analysis')
def analysis():

    # Redirect to login page if user is not logged in.
    if not current_user.is_authenticated:
        return redirect(url_for('login'))

    return render_template('/analysis.html', version_number=version_number)


@app.route('/system_hierarchy')
def system_hierarchy():

    # Redirect to login page if user is not logged in.
    if not current_user.is_authenticated:
        return redirect(url_for('login'))

    return render_template('/floc.html', version_number=version_number)


@app.route('/tags_list')
def tags_list():
    # Redirect to login page if user is not logged in.
    if not current_user.is_authenticated:
        return redirect(url_for('login'))
    return render_template('/tags.html', version_number=version_number)


@app.route('/systems_list')
def systems_list():
    # Redirect to login page if user is not logged in.
    if not current_user.is_authenticated:
        return redirect(url_for('login'))
    return render_template('/systems.html', version_number=version_number)


@app.route('/faults_list')
def faults_list():
    # Redirect to login page if user is not logged in.
    if not current_user.is_authenticated:
        return redirect(url_for('login'))
    return render_template('/faults.html', version_number=version_number)


@app.route('/analyses')
def analyses():
    # Redirect to login page if user is not logged in.
    if not current_user.is_authenticated:
        return redirect(url_for('login'))
    return render_template('/analyses.html', version_number=version_number)


@app.route('/analysis_types')
def analysis_types():
    # Redirect to login page if user is not logged in.
    if not current_user.is_authenticated:
        return redirect(url_for('login'))
    return render_template('/analysis_types.html', version_number=version_number)


@app.route('/datapoints')
def datapoints():
    # Redirect to login page if user is not logged in.
    if not current_user.is_authenticated:
        return redirect(url_for('login'))
    return render_template('/datapoints.html', version_number=version_number)


@app.route('/charts')
def charts():
    # Redirect to login page if user is not logged in.
    if not current_user.is_authenticated:
        return redirect(url_for('login'))
    return render_template('/charts.html', version_number=version_number)


@app.route('/analytics')
def analytics():
    # Redirect to login page if user is not logged in.
    if not current_user.is_authenticated:
        return redirect(url_for('login'))
    return render_template('/analytics.html', version_number=version_number)


@app.route('/similarity')
def similarity():

    # Redirect to login page if user is not logged in.
    if not current_user.is_authenticated:
        return redirect(url_for('login'))

    return render_template('/similarity.html', version_number=version_number)


# Return sitemap
@app.route('/sitemap.xml')
def sitemap():
    return send_from_directory(os.path.join(app.root_path, 'static'), 'sitemap.xml')