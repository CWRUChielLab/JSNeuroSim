/*jslint browser: true */
/*global ode: true, graph: true, simcontrols: true, electrophys: true, 
   componentModel: true */

// wait until the document has loaded
window.addEventListener('load', function () {
    'use strict';

    var params, layout, controlsPanel, controls, tMax = 600000e-3, 
        currentRunNumber = 0; 

    // set up the controls for the passive membrane simulation
    params = { 
        pulseStart_ms_C2: { label: 'Stimulus delay', units: 'ms', 
            defaultVal: 500, minVal: 0, maxVal: tMax / 1e-3 },
        pulseHeight_nA_C2: { label: 'Stimulus current', units: 'nA', 
            defaultVal: 3, minVal: -1000, maxVal: 1000 },
        pulseWidth_ms_C2: { label: 'Pulse duration', units: 'ms', 
            defaultVal: 5000, minVal: 0, maxVal: tMax / 1e-3 },
        isi_ms_C2: { label: 'Inter-stimulus interval', units: 'ms', 
            defaultVal: 500, minVal: 0, maxVal: tMax / 1e-3 },
        numPulses_C2: { label: 'Number of pulses', units: '', 
            defaultVal: 1, minVal: 0, maxVal: 100 },

        pulseStart_ms_DSI: { label: 'Stimulus delay', units: 'ms', 
            defaultVal: 500, minVal: 0, maxVal: tMax / 1e-3 },
        pulseHeight_nA_DSI: { label: 'Stimulus current', units: 'nA', 
            defaultVal: 3, minVal: -1000, maxVal: 1000 },
        pulseWidth_ms_DSI: { label: 'Pulse duration', units: 'ms', 
            defaultVal: 5000, minVal: 0, maxVal: tMax / 1e-3 },
        isi_ms_DSI: { label: 'Inter-stimulus interval', units: 'ms', 
            defaultVal: 500, minVal: 0, maxVal: tMax / 1e-3 },
        numPulses_DSI: { label: 'Number of pulses', units: '', 
            defaultVal: 1, minVal: 0, maxVal: 100 },

        pulseStart_ms_VSI: { label: 'Stimulus delay', units: 'ms', 
            defaultVal: 500, minVal: 0, maxVal: tMax / 1e-3 },
        pulseHeight_nA_VSI: { label: 'Stimulus current', units: 'nA', 
            defaultVal: 3, minVal: -1000, maxVal: 1000 },
        pulseWidth_ms_VSI: { label: 'Pulse duration', units: 'ms', 
            defaultVal: 5000, minVal: 0, maxVal: tMax / 1e-3 },
        isi_ms_VSI: { label: 'Inter-stimulus interval', units: 'ms', 
            defaultVal: 500, minVal: 0, maxVal: tMax / 1e-3 },
        numPulses_VSI: { label: 'Number of pulses', units: '', 
            defaultVal: 1, minVal: 0, maxVal: 100 },

        totalDuration_ms: { label: 'Total duration', units: 'ms', 
            defaultVal: 7000, minVal: 0, maxVal: tMax / 1e-3 },
        
        V_init_mV_C2: { label: 'Initial membrane potential', units: 'mV', 
            defaultVal: -48, minVal: -1000, maxVal: 1000 },
        C_nF_C2: { label: 'Membrane capacitance', units: 'nF', 
            defaultVal: 2.27, minVal: 0.01, maxVal: 100 },
        g_leak_uS_C2: { label: 'Leak conductance', units: '\u00B5S', 
            defaultVal: 1 / 23.3, minVal: 0.01, maxVal: 100 },
        E_leak_mV_C2: { label: 'Leak potential', units: 'mV', 
            defaultVal: -48, minVal: -1000, maxVal: 1000 },
        theta_ss_mV_C2: { label: 'Resting threshold', units: 'mV', 
            defaultVal: -34, minVal: -1000, maxVal: 1000 },
        theta_r_mV_C2: { label: 'Refractory threshold', units: 'mV', 
            defaultVal: 0, minVal: -1000, maxVal: 1000 },
        theta_tau_ms_C2: { label: 'Refractory time constant', units: 'ms', 
            defaultVal: 65, minVal: 0.1, maxVal: 1000000 },
        W_Fast_uS_C2: { label: 'Fast undershoot conductance', 
            units: '\u00B5S', defaultVal: 0.12, minVal: 0, maxVal: 100 },
        E_Fast_mV_C2: { label: 'Fast undershoot potential', units: 'mV', 
            defaultVal: -80, minVal: -1000, maxVal: 1000 },
        tau_open_Fast_ms_C2: { units: 'ms', 
            label: 'Fast undershoot opening time constant', 
            defaultVal: 10, minVal: 0.1, maxVal: 1000000 },
        tau_close_Fast_ms_C2: { units: 'ms', 
            label: 'Fast undershoot closing time constant', 
            defaultVal: 30, minVal: 0.1, maxVal: 1000000 },
        W_Med_uS_C2: { label: 'Medium undershoot conductance', 
            units: '\u00B5S', defaultVal: 0.028, minVal: 0, maxVal: 100 },
        E_Med_mV_C2: { label: 'Medium undershoot potential', units: 'mV', 
            defaultVal: -80, minVal: -1000, maxVal: 1000 },
        tau_open_Med_ms_C2: { units: 'ms', 
            label: 'Medium undershoot opening time constant', 
            defaultVal: 10, minVal: 0.1, maxVal: 1000000 },
        tau_close_Med_ms_C2: { units: 'ms',
            label: 'Medium undershoot closing time constant', 
            defaultVal: 1200, minVal: 0.1, maxVal: 1000000 },
        W_Slow_uS_C2: { label: 'Slow undershoot conductance', 
            units: '\u00B5S', defaultVal: 0.003, minVal: 0, maxVal: 100 },
        E_Slow_mV_C2: { label: 'Slow undershoot potential', units: 'mV', 
            defaultVal: -80, minVal: -1000, maxVal: 1000 },
        tau_open_Slow_ms_C2: { units: 'ms', 
            label: 'Slow undershoot opening time constant', 
            defaultVal: 4000, minVal: 0.1, maxVal: 1000000 },
        tau_close_Slow_ms_C2: { units: 'ms', 
            label: 'Slow undershoot closing time constant', 
            defaultVal: 4000, minVal: 0.1, maxVal: 1000000 },
        
        V_init_mV_DSI: { label: 'Initial membrane potential', units: 'mV', 
            defaultVal: -50, minVal: -1000, maxVal: 1000 },
        C_nF_DSI: { label: 'Membrane capacitance', units: 'nF', 
            defaultVal: 1.5714765, minVal: 0.01, maxVal: 100 },
        g_leak_uS_DSI: { label: 'Leak conductance', units: '\u00B5S', 
            defaultVal: 1 / 38.8, minVal: 0.01, maxVal: 100 },
        E_leak_mV_DSI: { label: 'Leak potential', units: 'mV', 
            defaultVal: -47.5, minVal: -1000, maxVal: 1000 },
        theta_ss_mV_DSI: { label: 'Resting threshold', units: 'mV', 
            defaultVal: -50, minVal: -1000, maxVal: 1000 },
        theta_r_mV_DSI: { label: 'Refractory threshold', units: 'mV', 
            defaultVal: 200, minVal: -1000, maxVal: 1000 },
        theta_tau_ms_DSI: { label: 'Refractory time constant', units: 'ms', 
            defaultVal: 15, minVal: 0.1, maxVal: 1000000 },
        G_Shunt_uS_DSI: { label: 'Shunt conductance', 
            units: '\u00B5S', defaultVal: 0.08, minVal: 0, maxVal: 100 },
        E_Shunt_mV_DSI: { label: 'Shunt potential', units: 'mV', 
            defaultVal: -47.5, minVal: -1000, maxVal: 1000 },
        B_m_mV_DSI: { label: 'Shunt m gate threshold', units: 'mV', 
            defaultVal: 29, minVal: -1000, maxVal: 1000 },
        C_m_mV_DSI: { label: 'Shunt m gate threshold width', units: 'mV', 
            defaultVal: -1, minVal: -1000, maxVal: 1000 },
        tau_m_ms_DSI: { label: 'Shunt m gate time constant', units: 'ms', 
            defaultVal: 10, minVal: 0.1, maxVal: 1000000 },
        B_h_mV_DSI: { label: 'Shunt h gate threshold', units: 'mV', 
            defaultVal: -100, minVal: -1000, maxVal: 1000 },
        C_h_mV_DSI: { label: 'Shunt h gate threshold width', units: 'mV', 
            defaultVal: 1, minVal: -1000, maxVal: 1000 },
        tau_h_ms_DSI: { label: 'Shunt h gate time constant', units: 'ms', 
            defaultVal: 100000, minVal: 0.1, maxVal: 1000000 },
        W_Fast_uS_DSI: { label: 'Fast undershoot conductance', 
            units: '\u00B5S', defaultVal: 0.3, minVal: 0, maxVal: 100 },
        E_Fast_mV_DSI: { label: 'Fast undershoot potential', units: 'mV', 
            defaultVal: -80, minVal: -1000, maxVal: 1000 },
        tau_open_Fast_ms_DSI: { units: 'ms', 
            label: 'Fast undershoot opening time constant', 
            defaultVal: 10, minVal: 0.1, maxVal: 1000000 },
        tau_close_Fast_ms_DSI: { units: 'ms', 
            label: 'Fast undershoot closing time constant', 
            defaultVal: 85, minVal: 0.1, maxVal: 1000000 },
        W_Slow_uS_DSI: { label: 'Slow undershoot conductance', 
            units: '\u00B5S', defaultVal: 0.012, minVal: 0, maxVal: 100 },
        E_Slow_mV_DSI: { label: 'Slow undershoot potential', units: 'mV', 
            defaultVal: -80, minVal: -1000, maxVal: 1000 },
        tau_open_Slow_ms_DSI: { units: 'ms', 
            label: 'Slow undershoot opening time constant', 
            defaultVal: 200, minVal: 0.1, maxVal: 1000000 },
        tau_close_Slow_ms_DSI: { units: 'ms', 
            label: 'Slow undershoot closing time constant', 
            defaultVal: 2800, minVal: 0.1, maxVal: 1000000 },
        W_E1_uS_DSI: { label: 'Self excitation conductance', 
            units: '\u00B5S', defaultVal: 0.00058, minVal: 0, maxVal: 100 },
        E_E1_mV_DSI: { label: 'Self excitation potential', units: 'mV', 
            defaultVal: 10, minVal: -1000, maxVal: 1000 },
        tau_open_E1_ms_DSI: { units: 'ms', 
            label: 'Self excitation opening time constant', 
            defaultVal: 850, minVal: 0.1, maxVal: 1000000 },
        tau_close_E1_ms_DSI: { units: 'ms', 
            label: 'Self excitation closing time constant', 
            defaultVal: 1100, minVal: 0.1, maxVal: 1000000 },
        
        V_init_mV_VSI: { label: 'Initial membrane potential', units: 'mV', 
            defaultVal: -60, minVal: -1000, maxVal: 1000 },
        C_nF_VSI: { label: 'Membrane capacitance', units: 'nF', 
            defaultVal: 3.2, minVal: 0.01, maxVal: 100 },
        g_leak_uS_VSI: { label: 'Leak conductance', units: '\u00B5S', 
            defaultVal: 1 / 14, minVal: 0.01, maxVal: 100 },
        E_leak_mV_VSI: { label: 'Leak potential', units: 'mV', 
            defaultVal: -56, minVal: -1000, maxVal: 1000 },
        theta_ss_mV_VSI: { label: 'Resting threshold', units: 'mV', 
            defaultVal: -38, minVal: -1000, maxVal: 1000 },
        theta_r_mV_VSI: { label: 'Refractory threshold', units: 'mV', 
            defaultVal: 10, minVal: -1000, maxVal: 1000 },
        theta_tau_ms_VSI: { label: 'Refractory time constant', units: 'ms', 
            defaultVal: 10, minVal: 0.1, maxVal: 1000000 },
        G_Shunt_uS_VSI: { label: 'Shunt conductance', 
            units: '\u00B5S', defaultVal: 1, minVal: 0, maxVal: 100 },
        E_Shunt_mV_VSI: { label: 'Shunt potential', units: 'mV', 
            defaultVal: -70, minVal: -1000, maxVal: 1000 },
        B_m_mV_VSI: { label: 'Shunt m gate threshold', units: 'mV', 
            defaultVal: 30, minVal: -1000, maxVal: 1000 },
        C_m_mV_VSI: { label: 'Shunt m gate threshold width', units: 'mV', 
            defaultVal: -9, minVal: -1000, maxVal: 1000 },
        tau_m_ms_VSI: { label: 'Shunt m gate time constant', units: 'ms', 
            defaultVal: 10, minVal: 0.1, maxVal: 1000000 },
        B_h_mV_VSI: { label: 'Shunt h gate threshold', units: 'mV', 
            defaultVal: 54, minVal: -1000, maxVal: 1000 },
        C_h_mV_VSI: { label: 'Shunt h gate threshold width', units: 'mV', 
            defaultVal: 4, minVal: -1000, maxVal: 1000 },
        tau_h_ms_VSI: { label: 'Shunt h gate time constant', units: 'ms', 
            defaultVal: 600, minVal: 0.1, maxVal: 1000000 },
        W_Fast_uS_VSI: { label: 'Fast undershoot conductance', 
            units: '\u00B5S', defaultVal: 0.54, minVal: 0, maxVal: 100 },
        E_Fast_mV_VSI: { label: 'Fast undershoot potential', units: 'mV', 
            defaultVal: -80, minVal: -1000, maxVal: 1000 },
        tau_open_Fast_ms_VSI: { units: 'ms', 
            label: 'Fast undershoot opening time constant', 
            defaultVal: 10, minVal: 0.1, maxVal: 1000000 },
        tau_close_Fast_ms_VSI: { units: 'ms', 
            label: 'Fast undershoot closing time constant', 
            defaultVal: 100, minVal: 0.1, maxVal: 1000000 },
        W_Slow_uS_VSI: { label: 'Slow undershoot conductance', 
            units: '\u00B5S', defaultVal: 0.0046, minVal: 0, maxVal: 100 },
        E_Slow_mV_VSI: { label: 'Slow undershoot potential', units: 'mV', 
            defaultVal: -80, minVal: -1000, maxVal: 1000 },
        tau_open_Slow_ms_VSI: { units: 'ms', 
            label: 'Slow undershoot opening time constant', 
            defaultVal: 1000, minVal: 0.1, maxVal: 1000000 },
        tau_close_Slow_ms_VSI: { units: 'ms', 
            label: 'Slow undershoot closing time constant', 
            defaultVal: 2500, minVal: 0.1, maxVal: 1000000 },
        W_E1_uS_VSI: { label: 'Self excitation conductance', 
            units: '\u00B5S', defaultVal: 0.028, minVal: 0, maxVal: 100 },
        E_E1_mV_VSI: { label: 'Self excitation potential', units: 'mV', 
            defaultVal: 10, minVal: -1000, maxVal: 1000 },
        tau_open_E1_ms_VSI: { units: 'ms', 
            label: 'Self excitation opening time constant', 
            defaultVal: 200, minVal: 0.1, maxVal: 1000000 },
        tau_close_E1_ms_VSI: { units: 'ms', 
            label: 'Self excitation closing time constant', 
            defaultVal: 500, minVal: 0.1, maxVal: 1000000 },

        W_E1_uS_C2toDSI: { label: 'E1 conductance', 
            units: '\u00B5S', defaultVal: 0.00029, minVal: 0, maxVal: 100 },
        E_E1_mV_C2toDSI: { label: 'E1 reversal potential', units: 'mV', 
            defaultVal: 10, minVal: -1000, maxVal: 1000 },
        tau_open_E1_ms_C2toDSI: { units: 'ms', 
            label: 'E1 opening time constant', 
            defaultVal: 300, minVal: 0.1, maxVal: 1000000 },
        tau_close_E1_ms_C2toDSI: { units: 'ms', 
            label: 'E1 closing time constant', 
            defaultVal: 300, minVal: 0.1, maxVal: 1000000 },
        W_I1_uS_C2toDSI: { label: 'I1 conductance', 
            units: '\u00B5S', defaultVal: 0.00063, minVal: 0, maxVal: 100 },
        E_I1_mV_C2toDSI: { label: 'I1 reversal potential', units: 'mV', 
            defaultVal: -80, minVal: -1000, maxVal: 1000 },
        tau_open_I1_ms_C2toDSI: { units: 'ms', 
            label: 'I1 opening time constant', 
            defaultVal: 400, minVal: 0.1, maxVal: 1000000 },
        tau_close_I1_ms_C2toDSI: { units: 'ms', 
            label: 'I1 closing time constant', 
            defaultVal: 4000, minVal: 0.1, maxVal: 1000000 },
        W_I2_uS_C2toDSI: { label: 'I2 conductance', 
            units: '\u00B5S', defaultVal: 0.00018, minVal: 0, maxVal: 100 },
        E_I2_mV_C2toDSI: { label: 'I2 reversal potential', units: 'mV', 
            defaultVal: -80, minVal: -1000, maxVal: 1000 },
        tau_open_I2_ms_C2toDSI: { units: 'ms', 
            label: 'I2 opening time constant', 
            defaultVal: 5000, minVal: 0.1, maxVal: 1000000 },
        tau_close_I2_ms_C2toDSI: { units: 'ms', 
            label: 'I2 closing time constant', 
            defaultVal: 14000, minVal: 0.1, maxVal: 1000000 },

        W_E1_uS_C2toVSI: { label: 'E1 conductance', 
            units: '\u00B5S', defaultVal: 0.0016, minVal: 0, maxVal: 100 },
        E_E1_mV_C2toVSI: { label: 'E1 reversal potential', units: 'mV', 
            defaultVal: 10, minVal: -1000, maxVal: 1000 },
        tau_open_E1_ms_C2toVSI: { units: 'ms', 
            label: 'E1 opening time constant', 
            defaultVal: 500, minVal: 0.1, maxVal: 1000000 },
        tau_close_E1_ms_C2toVSI: { units: 'ms', 
            label: 'E1 closing time constant', 
            defaultVal: 500, minVal: 0.1, maxVal: 1000000 },
        W_I1_uS_C2toVSI: { label: 'I1 conductance', 
            units: '\u00B5S', defaultVal: 0.006, minVal: 0, maxVal: 100 },
        E_I1_mV_C2toVSI: { label: 'I1 reversal potential', units: 'mV', 
            defaultVal: -80, minVal: -1000, maxVal: 1000 },
        tau_open_I1_ms_C2toVSI: { units: 'ms', 
            label: 'I1 opening time constant', 
            defaultVal: 1300, minVal: 0.1, maxVal: 1000000 },
        tau_close_I1_ms_C2toVSI: { units: 'ms', 
            label: 'I1 closing time constant', 
            defaultVal: 2300, minVal: 0.1, maxVal: 1000000 },
        W_I2_uS_C2toVSI: { label: 'I2 conductance', 
            units: '\u00B5S', defaultVal: 0.0026, minVal: 0, maxVal: 100 },
        E_I2_mV_C2toVSI: { label: 'I2 reversal potential', units: 'mV', 
            defaultVal: -80, minVal: -1000, maxVal: 1000 },
        tau_open_I2_ms_C2toVSI: { units: 'ms', 
            label: 'I2 opening time constant', 
            defaultVal: 7000, minVal: 0.1, maxVal: 1000000 },
        tau_close_I2_ms_C2toVSI: { units: 'ms', 
            label: 'I2 closing time constant', 
            defaultVal: 7000, minVal: 0.1, maxVal: 1000000 },

    };
    layout = [
        ['C2 Current Clamp', ['pulseStart_ms_C2', 'pulseHeight_nA_C2', 
            'pulseWidth_ms_C2', 'isi_ms_C2', 'numPulses_C2']],
        ['DSI Current Clamp', ['pulseStart_ms_DSI', 'pulseHeight_nA_DSI', 
            'pulseWidth_ms_DSI', 'isi_ms_DSI', 'numPulses_DSI']],
        ['VSI Current Clamp', ['pulseStart_ms_VSI', 'pulseHeight_nA_VSI', 
            'pulseWidth_ms_VSI', 'isi_ms_VSI', 'numPulses_VSI']],
        ['Simulation Settings', ['totalDuration_ms']],
        ['C2 Parameters', ['V_init_mV_C2', 'C_nF_C2', 'g_leak_uS_C2', 
            'E_leak_mV_C2', 'theta_ss_mV_C2', 'theta_r_mV_C2',
            'theta_tau_ms_C2', 'W_Fast_uS_C2', 'E_Fast_mV_C2',
            'tau_open_Fast_ms_C2', 'tau_close_Fast_ms_C2', 'W_Med_uS_C2',
            'E_Med_mV_C2', 'tau_open_Med_ms_C2', 'tau_close_Med_ms_C2',
            'W_Slow_uS_C2', 'E_Slow_mV_C2', 'tau_open_Slow_ms_C2',
            'tau_close_Slow_ms_C2']],
        ['DSI Parameters', ['V_init_mV_DSI', 'C_nF_DSI', 'g_leak_uS_DSI', 
            'E_leak_mV_DSI', 'theta_ss_mV_DSI', 'theta_r_mV_DSI',
            'theta_tau_ms_DSI', 'G_Shunt_uS_DSI', 'E_Shunt_mV_DSI',
            'B_m_mV_DSI', 'C_m_mV_DSI', 'tau_m_ms_DSI', 'B_h_mV_DSI',
            'C_h_mV_DSI', 'tau_h_ms_DSI', 'W_Fast_uS_DSI', 'E_Fast_mV_DSI',
            'tau_open_Fast_ms_DSI', 'tau_close_Fast_ms_DSI', 'W_Slow_uS_DSI',
            'E_Slow_mV_DSI', 'tau_open_Slow_ms_DSI', 'tau_close_Slow_ms_DSI',
            'W_E1_uS_VSI', 'E_E1_mV_VSI', 'tau_open_E1_ms_VSI',
            'tau_close_E1_ms_VSI']],
        ['VSI Parameters', ['V_init_mV_VSI', 'C_nF_VSI', 'g_leak_uS_VSI',
            'E_leak_mV_VSI', 'theta_ss_mV_VSI', 'theta_r_mV_VSI',
            'theta_tau_ms_VSI', 'G_Shunt_uS_VSI', 'E_Shunt_mV_VSI',
            'B_m_mV_VSI', 'C_m_mV_VSI', 'tau_m_ms_VSI', 'B_h_mV_VSI',
            'C_h_mV_VSI', 'tau_h_ms_VSI', 'W_Fast_uS_VSI', 'E_Fast_mV_VSI',
            'tau_open_Fast_ms_VSI', 'tau_close_Fast_ms_VSI', 'W_Slow_uS_VSI',
            'E_Slow_mV_VSI', 'tau_open_Slow_ms_VSI', 'tau_close_Slow_ms_VSI',
            'W_E1_uS_VSI', 'E_E1_mV_VSI', 'tau_open_E1_ms_VSI',
            'tau_close_E1_ms_VSI']],
        ['C2 to DSI synapse', ['W_E1_uS_C2toDSI', 'E_E1_mV_C2toDSI',
            'tau_open_E1_ms_C2toDSI', 'tau_close_E1_ms_C2toDSI',
            'W_I1_uS_C2toDSI', 'E_I1_mV_C2toDSI', 'tau_open_I1_ms_C2toDSI',
            'tau_close_I1_ms_C2toDSI', 'W_I2_uS_C2toDSI', 'E_I2_mV_C2toDSI',
            'tau_open_I2_ms_C2toDSI', 'tau_close_I2_ms_C2toDSI']],
        ['C2 to VSI synapse', ['W_E1_uS_C2toVSI', 'E_E1_mV_C2toVSI',
            'tau_open_E1_ms_C2toVSI', 'tau_close_E1_ms_C2toVSI',
            'W_I1_uS_C2toVSI', 'E_I1_mV_C2toVSI', 'tau_open_I1_ms_C2toVSI',
            'tau_close_I1_ms_C2toVSI', 'W_I2_uS_C2toVSI', 'E_I2_mV_C2toVSI',
            'tau_open_I2_ms_C2toVSI', 'tau_close_I2_ms_C2toVSI']]
    ];
    controlsPanel = document.getElementById('TritoniaControls');

    // simulate and plot the tritonia swim CPG from Calin-Jageman et al 2007
    function runSimulation() {
        var params, plotPanel, title,
            model, result,
            C2, C2Shunt, C2Fast, C2Med, C2Slow, pulseTrainC2,
            v_C2, v_C2_mV, iStim_C2_nA,
            DSI, DSIShunt, DSIFast, DSISlow, DSIToDSI_E1, pulseTrainDSI,
            v_DSI, v_DSI_mV, iStim_DSI_nA,
            VSI, VSIShunt, VSIFast, VSISlow, VSIToVSI_E1, pulseTrainVSI,
            v_VSI, v_VSI_mV, iStim_VSI_nA,
            C2toDSI_E1, C2toDSI_I1, C2toDSI_I2, 
            C2toVSI_E1, C2toVSI_I1, C2toVSI_I2, 
            t, t_ms, 
            startTime = new Date().getTime(),
            t0, y0, runNumber;
       
        params = controls.values;
        model = componentModel.componentModel();

        // create the C2 neuron
        C2 = electrophys.gettingIFNeuron(model, { 
            V_rest: params.V_init_mV_C2 * 1e-3, 
            C: params.C_nF_C2 * 1e-9, 
            g_leak: params.g_leak_uS_C2 * 1e-6, 
            E_leak: params.E_leak_mV_C2 * 1e-3, 
            theta_ss: params.theta_ss_mV_C2 * 1e-3, 
            theta_r: params.theta_r_mV_C2 * 1e-3, 
            theta_tau: params.theta_tau_ms_C2 * 1e-3 
        });
        C2Fast = electrophys.gettingSynapse(model, C2, C2, { 
            W: params.W_Fast_uS_C2 * 1e-6, 
            E_rev: params.E_Fast_mV_C2 * 1e-3, 
            tau_open: params.tau_open_Fast_ms_C2 * 1e-3, 
            tau_close: params.tau_close_Fast_ms_C2 * 1e-3, 
        });
        C2Med = electrophys.gettingSynapse(model, C2, C2, { 
            W: params.W_Med_uS_C2 * 1e-6, 
            E_rev: params.E_Med_mV_C2 * 1e-3, 
            tau_open: params.tau_open_Med_ms_C2 * 1e-3, 
            tau_close: params.tau_close_Med_ms_C2 * 1e-3, 
        });
        C2Slow = electrophys.gettingSynapse(model, C2, C2, { 
            W: params.W_Slow_uS_C2 * 1e-6, 
            E_rev: params.E_Slow_mV_C2 * 1e-3, 
            tau_open: params.tau_open_Slow_ms_C2 * 1e-3, 
            tau_close: params.tau_close_Slow_ms_C2 * 1e-3, 
        });
        pulseTrainC2 = electrophys.pulseTrain({
            start: 1e-3 * params.pulseStart_ms_C2, 
            width: params.pulseWidth_ms_C2 * 1e-3, 
            height: params.pulseHeight_nA_C2 * 1e-9,
            gap: params.isi_ms_C2 * 1e-3,
            num_pulses: params.numPulses_C2
        });
        C2.addCurrent(pulseTrainC2);
        

        // create the DSI neuron
        DSI = electrophys.gettingIFNeuron(model, { 
            V_rest: params.V_init_mV_DSI * 1e-3, 
            C: params.C_nF_DSI * 1e-9, 
            g_leak: params.g_leak_uS_DSI * 1e-6, 
            E_leak: params.E_leak_mV_DSI * 1e-3, 
            theta_ss: params.theta_ss_mV_DSI * 1e-3, 
            theta_r: params.theta_r_mV_DSI * 1e-3, 
            theta_tau: params.theta_tau_ms_DSI * 1e-3 
        });
        DSIShunt = electrophys.gettingShuntConductance(model, DSI, { 
            V_rest: params.V_init_mV_DSI * 1e-3, 
            G: params.G_Shunt_uS_DSI * 1e-6, 
            E_rev: params.E_Shunt_mV_DSI * 1e-3,
            B_m: params.B_m_mV_DSI * 1e-3,
            C_m: params.C_m_mV_DSI * 1e-3,
            tau_m: params.tau_m_ms_DSI * 1e-3,
            B_h: params.B_h_mV_DSI * 1e-3,
            C_h: params.C_h_mV_DSI * 1e-3,
            tau_h: params.tau_h_ms_DSI * 1e-3,
        });
        DSIFast = electrophys.gettingSynapse(model, DSI, DSI, { 
            W: params.W_Fast_uS_DSI * 1e-6, 
            E_rev: params.E_Fast_mV_DSI * 1e-3, 
            tau_open: params.tau_open_Fast_ms_DSI * 1e-3, 
            tau_close: params.tau_close_Fast_ms_DSI * 1e-3, 
        });
        DSISlow = electrophys.gettingSynapse(model, DSI, DSI, { 
            W: params.W_Slow_uS_DSI * 1e-6, 
            E_rev: params.E_Slow_mV_DSI * 1e-3, 
            tau_open: params.tau_open_Slow_ms_DSI * 1e-3, 
            tau_close: params.tau_close_Slow_ms_DSI * 1e-3, 
        });
        DSIToDSI_E1 = electrophys.gettingSynapse(model, DSI, DSI, { 
            W: params.W_E1_uS_DSI * 1e-6, 
            E_rev: params.E_E1_mV_DSI * 1e-3, 
            tau_open: params.tau_open_E1_ms_DSI * 1e-3, 
            tau_close: params.tau_close_E1_ms_DSI * 1e-3, 
        });
        pulseTrainDSI = electrophys.pulseTrain({
            start: 1e-3 * params.pulseStart_ms_DSI, 
            width: params.pulseWidth_ms_DSI * 1e-3, 
            height: params.pulseHeight_nA_DSI * 1e-9,
            gap: params.isi_ms_DSI * 1e-3,
            num_pulses: params.numPulses_DSI
        });
        DSI.addCurrent(pulseTrainDSI);
        

        // create the VSI neuron
        VSI = electrophys.gettingIFNeuron(model, { 
            V_rest: params.V_init_mV_VSI * 1e-3, 
            C: params.C_nF_VSI * 1e-9, 
            g_leak: params.g_leak_uS_VSI * 1e-6, 
            E_leak: params.E_leak_mV_VSI * 1e-3, 
            theta_ss: params.theta_ss_mV_VSI * 1e-3, 
            theta_r: params.theta_r_mV_VSI * 1e-3, 
            theta_tau: params.theta_tau_ms_VSI * 1e-3 
        });
        VSIShunt = electrophys.gettingShuntConductance(model, VSI, { 
            V_rest: params.V_init_mV_VSI * 1e-3, 
            G: params.G_Shunt_uS_VSI * 1e-6, 
            E_rev: params.E_Shunt_mV_VSI * 1e-3,
            B_m: params.B_m_mV_VSI * 1e-3,
            C_m: params.C_m_mV_VSI * 1e-3,
            tau_m: params.tau_m_ms_VSI * 1e-3,
            B_h: params.B_h_mV_VSI * 1e-3,
            C_h: params.C_h_mV_VSI * 1e-3,
            tau_h: params.tau_h_ms_VSI * 1e-3,
        });
        VSIFast = electrophys.gettingSynapse(model, VSI, VSI, { 
            W: params.W_Fast_uS_VSI * 1e-6, 
            E_rev: params.E_Fast_mV_VSI * 1e-3, 
            tau_open: params.tau_open_Fast_ms_VSI * 1e-3, 
            tau_close: params.tau_close_Fast_ms_VSI * 1e-3, 
        });
        VSISlow = electrophys.gettingSynapse(model, VSI, VSI, { 
            W: params.W_Slow_uS_VSI * 1e-6, 
            E_rev: params.E_Slow_mV_VSI * 1e-3, 
            tau_open: params.tau_open_Slow_ms_VSI * 1e-3, 
            tau_close: params.tau_close_Slow_ms_VSI * 1e-3, 
        });
        VSIToVSI_E1 = electrophys.gettingSynapse(model, VSI, VSI, { 
            W: params.W_E1_uS_VSI * 1e-6, 
            E_rev: params.E_E1_mV_VSI * 1e-3, 
            tau_open: params.tau_open_E1_ms_VSI * 1e-3, 
            tau_close: params.tau_close_E1_ms_VSI * 1e-3, 
        });
        pulseTrainVSI = electrophys.pulseTrain({
            start: 1e-3 * params.pulseStart_ms_VSI, 
            width: params.pulseWidth_ms_VSI * 1e-3, 
            height: params.pulseHeight_nA_VSI * 1e-9,
            gap: params.isi_ms_VSI * 1e-3,
            num_pulses: params.numPulses_VSI
        });
        VSI.addCurrent(pulseTrainVSI);
        
        // create the C2 to DSI synapse
        C2toDSI_E1 = electrophys.gettingSynapse(model, C2, DSI, { 
            W: params.W_E1_uS_C2toDSI * 1e-6, 
            E_rev: params.E_E1_mV_C2toDSI * 1e-3, 
            tau_open: params.tau_open_E1_ms_C2toDSI * 1e-3, 
            tau_close: params.tau_close_E1_ms_C2toDSI * 1e-3, 
        });
        C2toDSI_I1 = electrophys.gettingSynapse(model, C2, DSI, { 
            W: params.W_I1_uS_C2toDSI * 1e-6, 
            E_rev: params.E_I1_mV_C2toDSI * 1e-3, 
            tau_open: params.tau_open_I1_ms_C2toDSI * 1e-3, 
            tau_close: params.tau_close_I1_ms_C2toDSI * 1e-3, 
        });
        C2toDSI_I2 = electrophys.gettingSynapse(model, C2, DSI, { 
            W: params.W_I2_uS_C2toDSI * 1e-6, 
            E_rev: params.E_I2_mV_C2toDSI * 1e-3, 
            tau_open: params.tau_open_I2_ms_C2toDSI * 1e-3, 
            tau_close: params.tau_close_I2_ms_C2toDSI * 1e-3, 
        });
        
        // create the C2 to VSI synapse
        C2toVSI_E1 = electrophys.gettingSynapse(model, C2, VSI, { 
            W: params.W_E1_uS_C2toVSI * 1e-6, 
            E_rev: params.E_E1_mV_C2toVSI * 1e-3, 
            tau_open: params.tau_open_E1_ms_C2toVSI * 1e-3, 
            tau_close: params.tau_close_E1_ms_C2toVSI * 1e-3, 
        });
        C2toVSI_I1 = electrophys.gettingSynapse(model, C2, VSI, { 
            W: params.W_I1_uS_C2toVSI * 1e-6, 
            E_rev: params.E_I1_mV_C2toVSI * 1e-3, 
            tau_open: params.tau_open_I1_ms_C2toVSI * 1e-3, 
            tau_close: params.tau_close_I1_ms_C2toVSI * 1e-3, 
        });
        C2toVSI_I2 = electrophys.gettingSynapse(model, C2, VSI, { 
            W: params.W_I2_uS_C2toVSI * 1e-6, 
            E_rev: params.E_I2_mV_C2toVSI * 1e-3, 
            tau_open: params.tau_open_I2_ms_C2toVSI * 1e-3, 
            tau_close: params.tau_close_I2_ms_C2toVSI * 1e-3, 
        });

        // simulate them
        t_ms = [];
        v_C2_mV = [];
        iStim_C2_nA = [];
        v_DSI_mV = [];
        iStim_DSI_nA = [];
        v_VSI_mV = [];
        iStim_VSI_nA = [];

        // run for a bit to allow the simulation to stabilize
        result = model.integrate({
            tMin: -1.5, 
            tMax: 0, 
            tMaxStep: 16e-3,
        });
        t0 = 0;
        y0 = result.y_f;
        runNumber = currentRunNumber += 1;

        function updateSim() {
            if (runNumber !== currentRunNumber) {
                return;
            }

            result = model.integrate({
                tMin: t0, 
                tMax: params.totalDuration_ms * 1e-3, 
                tMaxStep: Math.min(16e-3, 
                    params.totalDuration_ms * 1e-3 / 500),
                y0: y0, 
                timeout: 500
            });
            
            t = result.t;
            v_C2 = C2.VWithSpikes(result.y, result.t);
            v_DSI = DSI.VWithSpikes(result.y, result.t);
            v_VSI = VSI.VWithSpikes(result.y, result.t);

            t_ms = t_ms.concat(graph.linearAxis(0, 1, 0, 1000)
                    .mapWorldToDisplay(t));
            v_C2_mV = v_C2_mV.concat(graph.linearAxis(0, 1, 0, 1000)
                    .mapWorldToDisplay(v_C2));
            iStim_C2_nA = iStim_C2_nA.concat(t.map(function (t) {
                return pulseTrainC2([], t) / 1e-9; 
            }));

            v_DSI_mV = v_DSI_mV.concat(graph.linearAxis(0, 1, 0, 1000)
                    .mapWorldToDisplay(v_DSI));
            iStim_DSI_nA = iStim_DSI_nA.concat(t.map(function (t) {
                return pulseTrainDSI([], t) / 1e-9; 
            }));

            v_VSI_mV = v_VSI_mV.concat(graph.linearAxis(0, 1, 0, 1000)
                    .mapWorldToDisplay(v_VSI));
            iStim_VSI_nA = iStim_VSI_nA.concat(t.map(function (t) {
                return pulseTrainVSI([], t) / 1e-9; 
            }));

            // plot the results
            plotPanel = document.getElementById('TritoniaPlots');
            plotPanel.innerHTML = '';
            
            title = document.createElement('h4');
            title.innerHTML = 'C2 potential (mV)';
            title.className = 'simplotheading';
            plotPanel.appendChild(title);
            graph.graph(plotPanel, 425, 150, t_ms, v_C2_mV,
                { xUnits: 'ms', yUnits: 'mV', minYRange: 20,
                    xMin: -0.02 * params.totalDuration_ms, 
                    xMax: params.totalDuration_ms});

            title = document.createElement('h4');
            title.innerHTML = 'C2 Stimulation current (nA)';
            title.className = 'simplotheading';
            plotPanel.appendChild(title);
            graph.graph(plotPanel, 425, 70, t_ms, iStim_C2_nA,
                { xUnits: 'ms', yUnits: 'nA',
                    xMin: -0.02 * params.totalDuration_ms, 
                    xMax: params.totalDuration_ms});

            title = document.createElement('h4');
            title.innerHTML = 'DSI potential (mV)';
            title.className = 'simplotheading';
            plotPanel.appendChild(title);
            graph.graph(plotPanel, 425, 150, t_ms, v_DSI_mV,
                { xUnits: 'ms', yUnits: 'mV', minYRange: 20,
                    xMin: -0.02 * params.totalDuration_ms, 
                    xMax: params.totalDuration_ms});

            title = document.createElement('h4');
            title.innerHTML = 'DSI Stimulation current (nA)';
            title.className = 'simplotheading';
            plotPanel.appendChild(title);
            graph.graph(plotPanel, 425, 70, t_ms, iStim_DSI_nA,
                { xUnits: 'ms', yUnits: 'nA',
                    xMin: -0.02 * params.totalDuration_ms, 
                    xMax: params.totalDuration_ms});

            title = document.createElement('h4');
            title.innerHTML = 'VSI potential (mV)';
            title.className = 'simplotheading';
            plotPanel.appendChild(title);
            graph.graph(plotPanel, 425, 150, t_ms, v_VSI_mV,
                { xUnits: 'ms', yUnits: 'mV', minYRange: 20,
                    xMin: -0.02 * params.totalDuration_ms, 
                    xMax: params.totalDuration_ms});

            title = document.createElement('h4');
            title.innerHTML = 'VSI Stimulation current (nA)';
            title.className = 'simplotheading';
            plotPanel.appendChild(title);
            graph.graph(plotPanel, 425, 70, t_ms, iStim_VSI_nA,
                { xUnits: 'ms', yUnits: 'nA',
                    xMin: -0.02 * params.totalDuration_ms, 
                    xMax: params.totalDuration_ms});

            if (result.terminationReason === 'Timeout') {
                t0 = result.t_f;
                y0 = result.y_f;
                window.setTimeout(updateSim, 0);
            } else {
                console.log('Total time: ' + 
                        (new Date().getTime() - startTime));
            }
        }

        window.setTimeout(updateSim, 0);
    }

    
    function reset() {
        controlsPanel.innerHTML = '';
        controls = simcontrols.controls(controlsPanel, params, layout);
        runSimulation();
    }


    (document.getElementById('TritoniaRunButton')
        .addEventListener('click', runSimulation, false));
    (document.getElementById('TritoniaResetButton')
        .addEventListener('click', reset, false));
    

    // make the enter key run the simulation  
    controlsPanel.addEventListener('keydown',  
        function (evt, element) {
            if (evt.keyCode === 13) { // enter was pressed 
                controls.triggerRead();
                runSimulation();
                return false;
            }
        }, true);

    reset();

}, false);

