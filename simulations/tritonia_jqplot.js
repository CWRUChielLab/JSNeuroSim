/*jslint browser: true */
/*global ode: true, graph: true, simcontrols: true, electrophys: true, 
   componentModel: true */

// wait until the document has loaded
window.addEventListener('load', function () {
    'use strict';

    var layout, controlsPanel, controls, dataPanel, debugPanel, voltageC2DataTable,
        currentC2DataTable, voltageDSIDataTable, currentDSIDataTable,
        voltageVSIDataTable, currentVSIDataTable, voltageDRIDataTable,
        currentDRIDataTable,
        tMax = 600000e-3,
        paramsUnmodulatedSwim, 
        paramsModulatedSwim, modulation,
        paramsIsolatedCells,
        plotHandles = [],
        currentRunNumber = 0; 

    // set up the controls for the passive membrane simulation
    paramsUnmodulatedSwim = { 
        pulseStart_ms_C2: { label: 'Stimulus delay', units: 'ms', 
            defaultVal: 500, minVal: 0, maxVal: tMax / 1e-3 },
        pulseHeight_nA_C2: { label: 'Stimulus current', units: 'nA', 
            defaultVal: 0, minVal: -1000, maxVal: 1000 },
        pulseWidth_ms_C2: { label: 'Pulse duration', units: 'ms', 
            defaultVal: 5000, minVal: 0, maxVal: tMax / 1e-3 },
        isi_ms_C2: { label: 'Inter-stimulus interval', units: 'ms', 
            defaultVal: 500, minVal: 0, maxVal: tMax / 1e-3 },
        numPulses_C2: { label: 'Number of pulses', units: '', 
            defaultVal: 1, minVal: 0, maxVal: 100 },

        pulseStart_ms_DSI: { label: 'Stimulus delay', units: 'ms', 
            defaultVal: 500, minVal: 0, maxVal: tMax / 1e-3 },
        pulseHeight_nA_DSI: { label: 'Stimulus current', units: 'nA', 
            defaultVal: 0, minVal: -1000, maxVal: 1000 },
        pulseWidth_ms_DSI: { label: 'Pulse duration', units: 'ms', 
            defaultVal: 5000, minVal: 0, maxVal: tMax / 1e-3 },
        isi_ms_DSI: { label: 'Inter-stimulus interval', units: 'ms', 
            defaultVal: 500, minVal: 0, maxVal: tMax / 1e-3 },
        numPulses_DSI: { label: 'Number of pulses', units: '', 
            defaultVal: 1, minVal: 0, maxVal: 100 },

        pulseStart_ms_VSI: { label: 'Stimulus delay', units: 'ms', 
            defaultVal: 500, minVal: 0, maxVal: tMax / 1e-3 },
        pulseHeight_nA_VSI: { label: 'Stimulus current', units: 'nA', 
            defaultVal: 0, minVal: -1000, maxVal: 1000 },
        pulseWidth_ms_VSI: { label: 'Pulse duration', units: 'ms', 
            defaultVal: 5000, minVal: 0, maxVal: tMax / 1e-3 },
        isi_ms_VSI: { label: 'Inter-stimulus interval', units: 'ms', 
            defaultVal: 500, minVal: 0, maxVal: tMax / 1e-3 },
        numPulses_VSI: { label: 'Number of pulses', units: '', 
            defaultVal: 1, minVal: 0, maxVal: 100 },

        pulseStart_ms_DRI: { label: 'Stimulus delay', units: 'ms', 
            defaultVal: 5000, minVal: 0, maxVal: tMax / 1e-3 },
        pulseHeight_nA_DRI: { label: 'Stimulus current', units: 'nA', 
            defaultVal: 5, minVal: -1000, maxVal: 1000 },
        pulseWidth_ms_DRI: { label: 'Pulse duration', units: 'ms', 
            defaultVal: 20, minVal: 0, maxVal: tMax / 1e-3 },
        isi_ms_DRI: { label: 'Inter-stimulus interval', units: 'ms', 
            defaultVal: 80, minVal: 0, maxVal: tMax / 1e-3 },
        numPulses_DRI: { label: 'Number of pulses', units: '', 
            defaultVal: 10, minVal: 0, maxVal: 100 },

        totalDuration_ms: { label: 'Total duration', units: 'ms', 
            defaultVal: 65000, minVal: 0, maxVal: tMax / 1e-3 },
        
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
        G_Shunt_uS_DSI: { label: 'Fast potassium conductance', 
            units: '\u00B5S', defaultVal: 0.08, minVal: 0, maxVal: 100 },
        E_Shunt_mV_DSI: { label: 'Fast potassium potential', units: 'mV', 
            defaultVal: -47.5, minVal: -1000, maxVal: 1000 },
        B_m_mV_DSI: { label: 'Fast potassium m gate threshold', units: 'mV', 
            defaultVal: 29, minVal: -1000, maxVal: 1000 },
        C_m_mV_DSI: { label: 'Fast potassium m gate threshold width', units: 'mV', 
            defaultVal: -1, minVal: -1000, maxVal: 1000 },
        tau_m_ms_DSI: { label: 'Fast potassium m gate time constant', units: 'ms', 
            defaultVal: 10, minVal: 0.1, maxVal: 1000000 },
        B_h_mV_DSI: { label: 'Fast potassium h gate threshold', units: 'mV', 
            defaultVal: -100, minVal: -1000, maxVal: 1000 },
        C_h_mV_DSI: { label: 'Fast potassium h gate threshold width', units: 'mV', 
            defaultVal: 1, minVal: -1000, maxVal: 1000 },
        tau_h_ms_DSI: { label: 'Fast potassium h gate time constant', units: 'ms', 
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
        G_Shunt_uS_VSI: { label: 'Fast potassium conductance', 
            units: '\u00B5S', defaultVal: 1, minVal: 0, maxVal: 100 },
        E_Shunt_mV_VSI: { label: 'Fast potassium potential', units: 'mV', 
            defaultVal: -70, minVal: -1000, maxVal: 1000 },
        B_m_mV_VSI: { label: 'Fast potassium m gate threshold', units: 'mV', 
            defaultVal: 30, minVal: -1000, maxVal: 1000 },
        C_m_mV_VSI: { label: 'Fast potassium m gate threshold width', units: 'mV', 
            defaultVal: -9, minVal: -1000, maxVal: 1000 },
        tau_m_ms_VSI: { label: 'Fast potassium m gate time constant', units: 'ms', 
            defaultVal: 10, minVal: 0.1, maxVal: 1000000 },
        B_h_mV_VSI: { label: 'Fast potassium h gate threshold', units: 'mV', 
            defaultVal: 54, minVal: -1000, maxVal: 1000 },
        C_h_mV_VSI: { label: 'Fast potassium h gate threshold width', units: 'mV', 
            defaultVal: 4, minVal: -1000, maxVal: 1000 },
        tau_h_ms_VSI: { label: 'Fast potassium h gate time constant', units: 'ms', 
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

        V_init_mV_DRI: { label: 'Initial membrane potential', units: 'mV', 
            defaultVal: -50, minVal: -1000, maxVal: 1000 },
        C_nF_DRI: { label: 'Membrane capacitance', units: 'nF', 
            defaultVal: 2, minVal: 0.01, maxVal: 100 },
        g_leak_uS_DRI: { label: 'Leak conductance', units: '\u00B5S', 
            defaultVal: 0.05, minVal: 0.01, maxVal: 100 },
        E_leak_mV_DRI: { label: 'Leak potential', units: 'mV', 
            defaultVal: -50, minVal: -1000, maxVal: 1000 },
        theta_ss_mV_DRI: { label: 'Resting threshold', units: 'mV', 
            defaultVal: -34, minVal: -1000, maxVal: 1000 },
        theta_r_mV_DRI: { label: 'Refractory threshold', units: 'mV', 
            defaultVal: 0, minVal: -1000, maxVal: 1000 },
        theta_tau_ms_DRI: { label: 'Refractory time constant', units: 'ms', 
            defaultVal: 10, minVal: 0.1, maxVal: 1000000 },
        W_Fast_uS_DRI: { label: 'Fast undershoot conductance', 
            units: '\u00B5S', defaultVal: 0.3, minVal: 0, maxVal: 100 },
        E_Fast_mV_DRI: { label: 'Fast undershoot potential', units: 'mV', 
            defaultVal: -80, minVal: -1000, maxVal: 1000 },
        tau_open_Fast_ms_DRI: { units: 'ms', 
            label: 'Fast undershoot opening time constant', 
            defaultVal: 10, minVal: 0.1, maxVal: 1000000 },
        tau_close_Fast_ms_DRI: { units: 'ms', 
            label: 'Fast undershoot closing time constant', 
            defaultVal: 25, minVal: 0.1, maxVal: 1000000 },

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

        W_E1_uS_DSItoC2: { label: 'E1 conductance', 
            units: '\u00B5S', defaultVal: 0.024, minVal: 0, maxVal: 100 },
        E_E1_mV_DSItoC2: { label: 'E1 reversal potential', units: 'mV', 
            defaultVal: 10, minVal: -1000, maxVal: 1000 },
        tau_open_E1_ms_DSItoC2: { units: 'ms', 
            label: 'E1 opening time constant', 
            defaultVal: 10, minVal: 0.1, maxVal: 1000000 },
        tau_close_E1_ms_DSItoC2: { units: 'ms', 
            label: 'E1 closing time constant', 
            defaultVal: 370, minVal: 0.1, maxVal: 1000000 },
        W_E2_uS_DSItoC2: { label: 'E2 conductance', 
            units: '\u00B5S', defaultVal: 0.00108, minVal: 0, maxVal: 100 },
        E_E2_mV_DSItoC2: { label: 'E2 reversal potential', units: 'mV', 
            defaultVal: 10, minVal: -1000, maxVal: 1000 },
        tau_open_E2_ms_DSItoC2: { units: 'ms', 
            label: 'E2 opening time constant', 
            defaultVal: 2200, minVal: 0.1, maxVal: 1000000 },
        tau_close_E2_ms_DSItoC2: { units: 'ms', 
            label: 'E2 closing time constant', 
            defaultVal: 2200, minVal: 0.1, maxVal: 1000000 },

        W_E1_uS_DSItoVSI: { label: 'E1 conductance', 
            units: '\u00B5S', defaultVal: 0.0072, minVal: 0, maxVal: 100 },
        E_E1_mV_DSItoVSI: { label: 'E1 reversal potential', units: 'mV', 
            defaultVal: 10, minVal: -1000, maxVal: 1000 },
        tau_open_E1_ms_DSItoVSI: { units: 'ms', 
            label: 'E1 opening time constant', 
            defaultVal: 300, minVal: 0.1, maxVal: 1000000 },
        tau_close_E1_ms_DSItoVSI: { units: 'ms', 
            label: 'E1 closing time constant', 
            defaultVal: 400, minVal: 0.1, maxVal: 1000000 },
        W_I1_uS_DSItoVSI: { label: 'I1 conductance', 
            units: '\u00B5S', defaultVal: 0.0105, minVal: 0, maxVal: 100 },
        E_I1_mV_DSItoVSI: { label: 'I1 reversal potential', units: 'mV', 
            defaultVal: -100, minVal: -1000, maxVal: 1000 },
        tau_open_I1_ms_DSItoVSI: { units: 'ms', 
            label: 'I1 opening time constant', 
            defaultVal: 600, minVal: 0.1, maxVal: 1000000 },
        tau_close_I1_ms_DSItoVSI: { units: 'ms', 
            label: 'I1 closing time constant', 
            defaultVal: 700, minVal: 0.1, maxVal: 1000000 },
        W_I2_uS_DSItoVSI: { label: 'I2 conductance', 
            units: '\u00B5S', defaultVal: 0.0012, minVal: 0, maxVal: 100 },
        E_I2_mV_DSItoVSI: { label: 'I2 reversal potential', units: 'mV', 
            defaultVal: -100, minVal: -1000, maxVal: 1000 },
        tau_open_I2_ms_DSItoVSI: { units: 'ms', 
            label: 'I2 opening time constant', 
            defaultVal: 3000, minVal: 0.1, maxVal: 1000000 },
        tau_close_I2_ms_DSItoVSI: { units: 'ms', 
            label: 'I2 closing time constant', 
            defaultVal: 3000, minVal: 0.1, maxVal: 1000000 },

        W_I1_uS_VSItoC2: { label: 'I1 conductance', 
            units: '\u00B5S', defaultVal: 0.07, minVal: 0, maxVal: 100 },
        E_I1_mV_VSItoC2: { label: 'I1 reversal potential', units: 'mV', 
            defaultVal: -60, minVal: -1000, maxVal: 1000 },
        tau_open_I1_ms_VSItoC2: { units: 'ms', 
            label: 'I1 opening time constant', 
            defaultVal: 300, minVal: 0.1, maxVal: 1000000 },
        tau_close_I1_ms_VSItoC2: { units: 'ms', 
            label: 'I1 closing time constant', 
            defaultVal: 6500, minVal: 0.1, maxVal: 1000000 },

        W_I1_uS_VSItoDSI: { label: 'I1 conductance', 
            units: '\u00B5S', defaultVal: 0.05, minVal: 0, maxVal: 100 },
        E_I1_mV_VSItoDSI: { label: 'I1 reversal potential', units: 'mV', 
            defaultVal: -80, minVal: -1000, maxVal: 1000 },
        tau_open_I1_ms_VSItoDSI: { units: 'ms', 
            label: 'I1 opening time constant', 
            defaultVal: 34, minVal: 0.1, maxVal: 1000000 },
        tau_close_I1_ms_VSItoDSI: { units: 'ms', 
            label: 'I1 closing time constant', 
            defaultVal: 100, minVal: 0.1, maxVal: 1000000 },
        W_I2_uS_VSItoDSI: { label: 'I2 conductance', 
            units: '\u00B5S', defaultVal: 0.018, minVal: 0, maxVal: 100 },
        E_I2_mV_VSItoDSI: { label: 'I2 reversal potential', units: 'mV', 
            defaultVal: -80, minVal: -1000, maxVal: 1000 },
        tau_open_I2_ms_VSItoDSI: { units: 'ms', 
            label: 'I2 opening time constant', 
            defaultVal: 200, minVal: 0.1, maxVal: 1000000 },
        tau_close_I2_ms_VSItoDSI: { units: 'ms', 
            label: 'I2 closing time constant', 
            defaultVal: 750, minVal: 0.1, maxVal: 1000000 },

        W_E1_uS_DRItoDSI: { label: 'E1 conductance', 
            units: '\u00B5S', defaultVal: 0.02, minVal: 0, maxVal: 100 },
        E_E1_mV_DRItoDSI: { label: 'E1 reversal potential', units: 'mV', 
            defaultVal: 10, minVal: -1000, maxVal: 1000 },
        tau_open_E1_ms_DRItoDSI: { units: 'ms', 
            label: 'E1 opening time constant', 
            defaultVal: 25, minVal: 0.1, maxVal: 1000000 },
        tau_close_E1_ms_DRItoDSI: { units: 'ms', 
            label: 'E1 closing time constant', 
            defaultVal: 15000, minVal: 0.1, maxVal: 1000000 },
    };


    // Modulated parameters:
    // start with a copy of the unmodulated parameters, then adjust
    modulation = 1;
    paramsModulatedSwim = JSON.parse(JSON.stringify(paramsUnmodulatedSwim));
    paramsModulatedSwim.tau_close_E1_ms_DSItoC2.defaultVal *= 1 + 
        2 * modulation;
    paramsModulatedSwim.tau_close_E2_ms_DSItoC2.defaultVal *= 3 + 
        2 * modulation;
    paramsModulatedSwim.W_E1_uS_DSItoC2.defaultVal *= 1 + 6.5 * modulation;
    paramsModulatedSwim.W_E2_uS_DSItoC2.defaultVal *= 1 + 6.5 * modulation;
    paramsModulatedSwim.W_E1_uS_C2toVSI.defaultVal *= 1 + 24 * modulation;
    paramsModulatedSwim.W_I1_uS_C2toVSI.defaultVal *= 1 + -1 * modulation;
    paramsModulatedSwim.W_I2_uS_C2toVSI.defaultVal *= 1 + -1 * modulation;
    paramsModulatedSwim.W_E1_uS_C2toDSI.defaultVal *= 1 + 20 * modulation;
    
    // uncorrelated parameter changes from paper
    //paramsModulatedSwim.tau_close_E1_ms_C2toDSI.defaultVal *= 1 + 
    //    2.5 * modulation;
    //paramsModulatedSwim.W_I1_uS_C2toDSI.defaultVal *= 1 + -1 * modulation;
    //paramsModulatedSwim.W_I2_uS_C2toDSI.defaultVal *= 1 + -1 * modulation;
    //paramsModulatedSwim.W_I1_uS_VSItoC2.defaultVal *= 1 + 3 * modulation;
    //paramsModulatedSwim.W_E1_uS_DRItoDSI.defaultVal *= 1 + 9 * modulation;
    
    // Stops spontaneous swimming (an addition - not in original paper)
    paramsModulatedSwim.E_leak_mV_DSI.defaultVal = -51;

    // choose a more attractive time window
    paramsModulatedSwim.pulseStart_ms_DRI.defaultVal = 1000;
    paramsModulatedSwim.totalDuration_ms.defaultVal = 50000;


    // Isolated cells
    // start with a copy of the unmodulated parameters, then remove synapses 
    modulation = 1;
    paramsIsolatedCells = JSON.parse(JSON.stringify(paramsUnmodulatedSwim));
    paramsIsolatedCells.W_E1_uS_C2toDSI.defaultVal = 0;
    paramsIsolatedCells.W_I1_uS_C2toDSI.defaultVal = 0;
    paramsIsolatedCells.W_I2_uS_C2toDSI.defaultVal = 0;
    paramsIsolatedCells.W_E1_uS_C2toVSI.defaultVal = 0;
    paramsIsolatedCells.W_I1_uS_C2toVSI.defaultVal = 0;
    paramsIsolatedCells.W_I2_uS_C2toVSI.defaultVal = 0;
    paramsIsolatedCells.W_E1_uS_DSItoC2.defaultVal = 0;
    paramsIsolatedCells.W_E2_uS_DSItoC2.defaultVal = 0;
    paramsIsolatedCells.W_E1_uS_DSItoVSI.defaultVal = 0;
    paramsIsolatedCells.W_I1_uS_DSItoVSI.defaultVal = 0;
    paramsIsolatedCells.W_I2_uS_DSItoVSI.defaultVal = 0;
    paramsIsolatedCells.W_I1_uS_VSItoC2.defaultVal = 0;
    paramsIsolatedCells.W_I1_uS_VSItoDSI.defaultVal = 0;
    paramsIsolatedCells.W_I2_uS_VSItoDSI.defaultVal = 0;
    paramsIsolatedCells.W_E1_uS_DRItoDSI.defaultVal = 0;
    // set up the simulation to match fig 3 from paper
    paramsIsolatedCells.totalDuration_ms.defaultVal = 7000;
    paramsIsolatedCells.pulseHeight_nA_C2.defaultVal = 3;
    paramsIsolatedCells.pulseHeight_nA_DSI.defaultVal = 3;
    paramsIsolatedCells.pulseHeight_nA_VSI.defaultVal = 2.5;
    paramsIsolatedCells.pulseHeight_nA_DRI.defaultVal = 0;



    layout = [
        ['C2 Current Clamp', ['pulseStart_ms_C2', 'pulseHeight_nA_C2', 
            'pulseWidth_ms_C2', 'isi_ms_C2', 'numPulses_C2']],
        ['DSI Current Clamp', ['pulseStart_ms_DSI', 'pulseHeight_nA_DSI', 
            'pulseWidth_ms_DSI', 'isi_ms_DSI', 'numPulses_DSI']],
        ['VSI-B Current Clamp', ['pulseStart_ms_VSI', 'pulseHeight_nA_VSI', 
            'pulseWidth_ms_VSI', 'isi_ms_VSI', 'numPulses_VSI']],
        ['DRI Current Clamp', ['pulseStart_ms_DRI', 'pulseHeight_nA_DRI', 
            'pulseWidth_ms_DRI', 'isi_ms_DRI', 'numPulses_DRI']],
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
        ['VSI-B Parameters', ['V_init_mV_VSI', 'C_nF_VSI', 'g_leak_uS_VSI',
            'E_leak_mV_VSI', 'theta_ss_mV_VSI', 'theta_r_mV_VSI',
            'theta_tau_ms_VSI', 'G_Shunt_uS_VSI', 'E_Shunt_mV_VSI',
            'B_m_mV_VSI', 'C_m_mV_VSI', 'tau_m_ms_VSI', 'B_h_mV_VSI',
            'C_h_mV_VSI', 'tau_h_ms_VSI', 'W_Fast_uS_VSI', 'E_Fast_mV_VSI',
            'tau_open_Fast_ms_VSI', 'tau_close_Fast_ms_VSI', 'W_Slow_uS_VSI',
            'E_Slow_mV_VSI', 'tau_open_Slow_ms_VSI', 'tau_close_Slow_ms_VSI',
            'W_E1_uS_VSI', 'E_E1_mV_VSI', 'tau_open_E1_ms_VSI',
            'tau_close_E1_ms_VSI']],
        ['DRI Parameters', ['V_init_mV_DRI', 'C_nF_DRI', 'g_leak_uS_DRI', 
            'E_leak_mV_DRI', 'theta_ss_mV_DRI', 'theta_r_mV_DRI',
            'theta_tau_ms_DRI', 'W_Fast_uS_DRI', 'E_Fast_mV_DRI',
            'tau_open_Fast_ms_DRI', 'tau_close_Fast_ms_DRI']],
        ['C2 to DSI synapse', ['W_E1_uS_C2toDSI', 'E_E1_mV_C2toDSI',
            'tau_open_E1_ms_C2toDSI', 'tau_close_E1_ms_C2toDSI',
            'W_I1_uS_C2toDSI', 'E_I1_mV_C2toDSI', 'tau_open_I1_ms_C2toDSI',
            'tau_close_I1_ms_C2toDSI', 'W_I2_uS_C2toDSI', 'E_I2_mV_C2toDSI',
            'tau_open_I2_ms_C2toDSI', 'tau_close_I2_ms_C2toDSI']],
        ['C2 to VSI-B synapse', ['W_E1_uS_C2toVSI', 'E_E1_mV_C2toVSI',
            'tau_open_E1_ms_C2toVSI', 'tau_close_E1_ms_C2toVSI',
            'W_I1_uS_C2toVSI', 'E_I1_mV_C2toVSI', 'tau_open_I1_ms_C2toVSI',
            'tau_close_I1_ms_C2toVSI', 'W_I2_uS_C2toVSI', 'E_I2_mV_C2toVSI',
            'tau_open_I2_ms_C2toVSI', 'tau_close_I2_ms_C2toVSI']],
        ['DSI to C2 synapse', ['W_E1_uS_DSItoC2', 'E_E1_mV_DSItoC2',
            'tau_open_E1_ms_DSItoC2', 'tau_close_E1_ms_DSItoC2',
            'W_E2_uS_DSItoC2', 'E_E2_mV_DSItoC2',
            'tau_open_E2_ms_DSItoC2', 'tau_close_E2_ms_DSItoC2']],
        ['DSI to VSI-B synapse', ['W_E1_uS_DSItoVSI', 'E_E1_mV_DSItoVSI',
            'tau_open_E1_ms_DSItoVSI', 'tau_close_E1_ms_DSItoVSI',
            'W_I1_uS_DSItoVSI', 'E_I1_mV_DSItoVSI', 'tau_open_I1_ms_DSItoVSI',
            'tau_close_I1_ms_DSItoVSI', 'W_I2_uS_DSItoVSI', 'E_I2_mV_DSItoVSI',
            'tau_open_I2_ms_DSItoVSI', 'tau_close_I2_ms_DSItoVSI']],
        ['VSI-B to C2 synapse', ['W_I1_uS_VSItoC2', 'E_I1_mV_VSItoC2', 
            'tau_open_I1_ms_VSItoC2', 'tau_close_I1_ms_VSItoC2' ]],
        ['VSI-B to DSI synapse', ['W_I1_uS_VSItoDSI', 'E_I1_mV_VSItoDSI', 
            'tau_open_I1_ms_VSItoDSI', 'tau_close_I1_ms_VSItoDSI',
            'W_I2_uS_VSItoDSI', 'E_I2_mV_VSItoDSI', 'tau_open_I2_ms_VSItoDSI',
            'tau_close_I2_ms_VSItoDSI']],
        ['DRI to DSI synapse', ['W_E1_uS_DRItoDSI', 'E_E1_mV_DRItoDSI', 
            'tau_open_E1_ms_DRItoDSI', 'tau_close_E1_ms_DRItoDSI' ]]
    ];
    controlsPanel = document.getElementById('TritoniaControls');

    // prepare tables for displaying captured data points
    dataPanel = document.getElementById('TritoniaData');
    dataPanel.className = 'datapanel';

    voltageC2DataTable = document.createElement('table');
    voltageC2DataTable.className = 'datatable';
    dataPanel.appendChild(voltageC2DataTable);

    currentC2DataTable = document.createElement('table');
    currentC2DataTable.className = 'datatable';
    dataPanel.appendChild(currentC2DataTable);

    voltageDSIDataTable = document.createElement('table');
    voltageDSIDataTable.className = 'datatable';
    dataPanel.appendChild(voltageDSIDataTable);

    currentDSIDataTable = document.createElement('table');
    currentDSIDataTable.className = 'datatable';
    dataPanel.appendChild(currentDSIDataTable);

    voltageVSIDataTable = document.createElement('table');
    voltageVSIDataTable.className = 'datatable';
    dataPanel.appendChild(voltageVSIDataTable);

    currentVSIDataTable = document.createElement('table');
    currentVSIDataTable.className = 'datatable';
    dataPanel.appendChild(currentVSIDataTable);

    voltageDRIDataTable = document.createElement('table');
    voltageDRIDataTable.className = 'datatable';
    dataPanel.appendChild(voltageDRIDataTable);

    currentDRIDataTable = document.createElement('table');
    currentDRIDataTable.className = 'datatable';
    dataPanel.appendChild(currentDRIDataTable);

    // simulate and plot the tritonia swim CPG from Calin-Jageman et al 2007
    function runSimulation() {
        var params, plot, plotPanel, title,
            model, result,
            C2, C2Fast, C2Med, C2Slow, pulseTrainC2,
            v_C2, v_C2_mV, iStim_C2, iStim_C2_nA,
            DSI, DSIShunt, DSIFast, DSISlow, DSIToDSI_E1, pulseTrainDSI,
            v_DSI, v_DSI_mV, iStim_DSI, iStim_DSI_nA,
            VSI, VSIShunt, VSIFast, VSISlow, VSIToVSI_E1, pulseTrainVSI,
            v_VSI, v_VSI_mV, iStim_VSI, iStim_VSI_nA,
            DRI, DRIFast, pulseTrainDRI,
            v_DRI, v_DRI_mV, iStim_DRI, iStim_DRI_nA,
            C2toDSI_E1, C2toDSI_I1, C2toDSI_I2, 
            C2toVSI_E1, C2toVSI_I1, C2toVSI_I2, 
            DSItoC2_E1, DSItoC2_E2, 
            DSItoVSI_E1, DSItoVSI_I1, DSItoVSI_I2, 
            VSItoC2_I1, 
            VSItoDSI_I1, VSItoDSI_I2, 
            DRItoDSI_E1, 
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
        
        
        // create the DRI neuron
        DRI = electrophys.gettingIFNeuron(model, { 
            V_rest: params.V_init_mV_DRI * 1e-3, 
            C: params.C_nF_DRI * 1e-9, 
            g_leak: params.g_leak_uS_DRI * 1e-6, 
            E_leak: params.E_leak_mV_DRI * 1e-3, 
            theta_ss: params.theta_ss_mV_DRI * 1e-3, 
            theta_r: params.theta_r_mV_DRI * 1e-3, 
            theta_tau: params.theta_tau_ms_DRI * 1e-3 
        });
        DRIFast = electrophys.gettingSynapse(model, DRI, DRI, { 
            W: params.W_Fast_uS_DRI * 1e-6, 
            E_rev: params.E_Fast_mV_DRI * 1e-3, 
            tau_open: params.tau_open_Fast_ms_DRI * 1e-3, 
            tau_close: params.tau_close_Fast_ms_DRI * 1e-3, 
        });
        pulseTrainDRI = electrophys.pulseTrain({
            start: 1e-3 * params.pulseStart_ms_DRI, 
            width: params.pulseWidth_ms_DRI * 1e-3, 
            height: params.pulseHeight_nA_DRI * 1e-9,
            gap: params.isi_ms_DRI * 1e-3,
            num_pulses: params.numPulses_DRI
        });
        DRI.addCurrent(pulseTrainDRI);
        

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


        // create the DSI to C2 synapse
        DSItoC2_E1 = electrophys.gettingSynapse(model, DSI, C2, { 
            W: params.W_E1_uS_DSItoC2 * 1e-6, 
            E_rev: params.E_E1_mV_DSItoC2 * 1e-3, 
            tau_open: params.tau_open_E1_ms_DSItoC2 * 1e-3, 
            tau_close: params.tau_close_E1_ms_DSItoC2 * 1e-3, 
        });
        DSItoC2_E2 = electrophys.gettingSynapse(model, DSI, C2, { 
            W: params.W_E2_uS_DSItoC2 * 1e-6, 
            E_rev: params.E_E2_mV_DSItoC2 * 1e-3, 
            tau_open: params.tau_open_E2_ms_DSItoC2 * 1e-3, 
            tau_close: params.tau_close_E2_ms_DSItoC2 * 1e-3, 
        });
        

        // create the DSI to VSI synapse
        DSItoVSI_E1 = electrophys.gettingSynapse(model, DSI, VSI, { 
            W: params.W_E1_uS_DSItoVSI * 1e-6, 
            E_rev: params.E_E1_mV_DSItoVSI * 1e-3, 
            tau_open: params.tau_open_E1_ms_DSItoVSI * 1e-3, 
            tau_close: params.tau_close_E1_ms_DSItoVSI * 1e-3, 
        });
        DSItoVSI_I1 = electrophys.gettingSynapse(model, DSI, VSI, { 
            W: params.W_I1_uS_DSItoVSI * 1e-6, 
            E_rev: params.E_I1_mV_DSItoVSI * 1e-3, 
            tau_open: params.tau_open_I1_ms_DSItoVSI * 1e-3, 
            tau_close: params.tau_close_I1_ms_DSItoVSI * 1e-3, 
        });
        DSItoVSI_I2 = electrophys.gettingSynapse(model, DSI, VSI, { 
            W: params.W_I2_uS_DSItoVSI * 1e-6, 
            E_rev: params.E_I2_mV_DSItoVSI * 1e-3, 
            tau_open: params.tau_open_I2_ms_DSItoVSI * 1e-3, 
            tau_close: params.tau_close_I2_ms_DSItoVSI * 1e-3, 
        });
        

        // create the VSI to C2 synapse
        VSItoC2_I1 = electrophys.gettingSynapse(model, VSI, C2, { 
            W: params.W_I1_uS_VSItoC2 * 1e-6, 
            E_rev: params.E_I1_mV_VSItoC2 * 1e-3, 
            tau_open: params.tau_open_I1_ms_VSItoC2 * 1e-3, 
            tau_close: params.tau_close_I1_ms_VSItoC2 * 1e-3, 
        });
        

        // create the VSI to DSI synapse
        VSItoDSI_I1 = electrophys.gettingSynapse(model, VSI, DSI, { 
            W: params.W_I1_uS_VSItoDSI * 1e-6, 
            E_rev: params.E_I1_mV_VSItoDSI * 1e-3, 
            tau_open: params.tau_open_I1_ms_VSItoDSI * 1e-3, 
            tau_close: params.tau_close_I1_ms_VSItoDSI * 1e-3, 
        });
        VSItoDSI_I2 = electrophys.gettingSynapse(model, VSI, DSI, { 
            W: params.W_I2_uS_VSItoDSI * 1e-6, 
            E_rev: params.E_I2_mV_VSItoDSI * 1e-3, 
            tau_open: params.tau_open_I2_ms_VSItoDSI * 1e-3, 
            tau_close: params.tau_close_I2_ms_VSItoDSI * 1e-3, 
        });
        

        // create the DRI to DSI synapse
        DRItoDSI_E1 = electrophys.gettingSynapse(model, DRI, DSI, { 
            W: params.W_E1_uS_DRItoDSI * 1e-6, 
            E_rev: params.E_E1_mV_DRItoDSI * 1e-3, 
            tau_open: params.tau_open_E1_ms_DRItoDSI * 1e-3, 
            tau_close: params.tau_close_E1_ms_DRItoDSI * 1e-3, 
        });


        // simulate them
        v_C2_mV = [];
        iStim_C2_nA = [];
        v_DSI_mV = [];
        iStim_DSI_nA = [];
        v_VSI_mV = [];
        iStim_VSI_nA = [];
        v_DRI_mV = [];
        iStim_DRI_nA = [];

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
            
            v_C2      = result.mapOrderedPairs(C2.VWithSpikes);
            v_DSI     = result.mapOrderedPairs(DSI.VWithSpikes);
            v_VSI     = result.mapOrderedPairs(VSI.VWithSpikes);
            v_DRI     = result.mapOrderedPairs(DRI.VWithSpikes);
            iStim_C2  = result.mapOrderedPairs(pulseTrainC2);
            iStim_DSI = result.mapOrderedPairs(pulseTrainDSI);
            iStim_VSI = result.mapOrderedPairs(pulseTrainVSI);
            iStim_DRI = result.mapOrderedPairs(pulseTrainDRI);

            // convert to the right units
            // each ordered pair consists of a time and another variable
            v_C2_mV      = v_C2_mV.concat(v_C2.map           (function (v) {return [v[0] / 1e-3, v[1] / 1e-3];}));
            v_DSI_mV     = v_DSI_mV.concat(v_DSI.map         (function (v) {return [v[0] / 1e-3, v[1] / 1e-3];}));
            v_VSI_mV     = v_VSI_mV.concat(v_VSI.map         (function (v) {return [v[0] / 1e-3, v[1] / 1e-3];}));
            v_DRI_mV     = v_DRI_mV.concat(v_DRI.map         (function (v) {return [v[0] / 1e-3, v[1] / 1e-3];}));
            iStim_C2_nA  = iStim_C2_nA.concat(iStim_C2.map   (function (i) {return [i[0] / 1e-3, i[1] / 1e-9]}));
            iStim_DSI_nA = iStim_DSI_nA.concat(iStim_DSI.map (function (i) {return [i[0] / 1e-3, i[1] / 1e-9]}));
            iStim_VSI_nA = iStim_VSI_nA.concat(iStim_VSI.map (function (i) {return [i[0] / 1e-3, i[1] / 1e-9]}));
            iStim_DRI_nA = iStim_DRI_nA.concat(iStim_DRI.map (function (i) {return [i[0] / 1e-3, i[1] / 1e-9]}));

            // free resources from old plots
            while (plotHandles.length > 0) {
                plotHandles.pop().destroy();
            }

            // plot the results
            plotPanel = document.getElementById('TritoniaPlots');
            plotPanel.innerHTML = '';

            // C2 Voltage
            title = document.createElement('h4');
            title.innerHTML = 'C2 Membrane Potential';
            title.className = 'simplotheading';
            plotPanel.appendChild(title);
            plot = document.createElement('div');
            plot.id = 'voltageC2Plot';
            plot.style.width = '425px';
            plot.style.height = '200px';
            plotPanel.appendChild(plot);
            plotHandles.push(
               $.jqplot('voltageC2Plot', [v_C2_mV], jQuery.extend(true, {}, graphJqplot.defaultOptions(params), {
                    axes: {
                        xaxis: {label:'Time (ms)'},
                        yaxis: {label:'Membrane Potential (mV)'},
                    },
                    series: [
                        {label: 'V<sub>m</sub>', color: 'black'},
                    ],
            })));
            graphJqplot.bindDataCapture('#voltageC2Plot', voltageC2DataTable, title.innerHTML, 'Time');
            graphJqplot.bindCursorTooltip('#voltageC2Plot', 'Time', 'ms', 'mV');

            // C2 Current
            title = document.createElement('h4');
            title.innerHTML = 'C2 Stimulation Current';
            title.className = 'simplotheading';
            plotPanel.appendChild(title);
            plot = document.createElement('div');
            plot.id = 'currentC2Plot';
            plot.style.width = '425px';
            plot.style.height = '200px';
            plotPanel.appendChild(plot);
            plotHandles.push(
               $.jqplot('currentC2Plot', [iStim_C2_nA], jQuery.extend(true, {}, graphJqplot.defaultOptions(params), {
                    axes: {
                        xaxis: {label:'Time (ms)'},
                        yaxis: {label:'Current (nA)'},
                    },
                    series: [
                        {label: 'I<sub>stim</sub>', color: 'black'},
                    ],
            })));
            graphJqplot.bindDataCapture('#currentC2Plot', currentC2DataTable, title.innerHTML, 'Time');
            graphJqplot.bindCursorTooltip('#currentC2Plot', 'Time', 'ms', 'nA');

            // DSI Voltage
            title = document.createElement('h4');
            title.innerHTML = 'DSI Membrane Potential';
            title.className = 'simplotheading';
            plotPanel.appendChild(title);
            plot = document.createElement('div');
            plot.id = 'voltageDSIPlot';
            plot.style.width = '425px';
            plot.style.height = '200px';
            plotPanel.appendChild(plot);
            plotHandles.push(
               $.jqplot('voltageDSIPlot', [v_DSI_mV], jQuery.extend(true, {}, graphJqplot.defaultOptions(params), {
                    axes: {
                        xaxis: {label:'Time (ms)'},
                        yaxis: {label:'Membrane Potential (mV)'},
                    },
                    series: [
                        {label: 'V<sub>m</sub>', color: 'black'},
                    ],
            })));
            graphJqplot.bindDataCapture('#voltageDSIPlot', voltageDSIDataTable, title.innerHTML, 'Time');
            graphJqplot.bindCursorTooltip('#voltageDSIPlot', 'Time', 'ms', 'mV');

            // DSI Current
            title = document.createElement('h4');
            title.innerHTML = 'DSI Stimulation Current';
            title.className = 'simplotheading';
            plotPanel.appendChild(title);
            plot = document.createElement('div');
            plot.id = 'currentDSIPlot';
            plot.style.width = '425px';
            plot.style.height = '200px';
            plotPanel.appendChild(plot);
            plotHandles.push(
               $.jqplot('currentDSIPlot', [iStim_DSI_nA], jQuery.extend(true, {}, graphJqplot.defaultOptions(params), {
                    axes: {
                        xaxis: {label:'Time (ms)'},
                        yaxis: {label:'Current (nA)'},
                    },
                    series: [
                        {label: 'I<sub>stim</sub>', color: 'black'},
                    ],
            })));
            graphJqplot.bindDataCapture('#currentDSIPlot', currentDSIDataTable, title.innerHTML, 'Time');
            graphJqplot.bindCursorTooltip('#currentDSIPlot', 'Time', 'ms', 'nA');

            // VSI Voltage
            title = document.createElement('h4');
            title.innerHTML = 'VSI-B Membrane Potential';
            title.className = 'simplotheading';
            plotPanel.appendChild(title);
            plot = document.createElement('div');
            plot.id = 'voltageVSIPlot';
            plot.style.width = '425px';
            plot.style.height = '200px';
            plotPanel.appendChild(plot);
            plotHandles.push(
               $.jqplot('voltageVSIPlot', [v_VSI_mV], jQuery.extend(true, {}, graphJqplot.defaultOptions(params), {
                    axes: {
                        xaxis: {label:'Time (ms)'},
                        yaxis: {label:'Membrane Potential (mV)'},
                    },
                    series: [
                        {label: 'V<sub>m</sub>', color: 'black'},
                    ],
            })));
            graphJqplot.bindDataCapture('#voltageVSIPlot', voltageVSIDataTable, title.innerHTML, 'Time');
            graphJqplot.bindCursorTooltip('#voltageVSIPlot', 'Time', 'ms', 'mV');

            // VSI Current
            title = document.createElement('h4');
            title.innerHTML = 'VSI-B Stimulation Current';
            title.className = 'simplotheading';
            plotPanel.appendChild(title);
            plot = document.createElement('div');
            plot.id = 'currentVSIPlot';
            plot.style.width = '425px';
            plot.style.height = '200px';
            plotPanel.appendChild(plot);
            plotHandles.push(
               $.jqplot('currentVSIPlot', [iStim_VSI_nA], jQuery.extend(true, {}, graphJqplot.defaultOptions(params), {
                    axes: {
                        xaxis: {label:'Time (ms)'},
                        yaxis: {label:'Current (nA)'},
                    },
                    series: [
                        {label: 'I<sub>stim</sub>', color: 'black'},
                    ],
            })));
            graphJqplot.bindDataCapture('#currentVSIPlot', currentVSIDataTable, title.innerHTML, 'Time');
            graphJqplot.bindCursorTooltip('#currentVSIPlot', 'Time', 'ms', 'nA');

            // DRI Voltage
            title = document.createElement('h4');
            title.innerHTML = 'DRI Membrane Potential';
            title.className = 'simplotheading';
            plotPanel.appendChild(title);
            plot = document.createElement('div');
            plot.id = 'voltageDRIPlot';
            plot.style.width = '425px';
            plot.style.height = '200px';
            plotPanel.appendChild(plot);
            plotHandles.push(
               $.jqplot('voltageDRIPlot', [v_DRI_mV], jQuery.extend(true, {}, graphJqplot.defaultOptions(params), {
                    axes: {
                        xaxis: {label:'Time (ms)'},
                        yaxis: {label:'Membrane Potential (mV)'},
                    },
                    series: [
                        {label: 'V<sub>m</sub>', color: 'black'},
                    ],
            })));
            graphJqplot.bindDataCapture('#voltageDRIPlot', voltageDRIDataTable, title.innerHTML, 'Time');
            graphJqplot.bindCursorTooltip('#voltageDRIPlot', 'Time', 'ms', 'mV');

            // DRI Current
            title = document.createElement('h4');
            title.innerHTML = 'DRI Stimulation Current';
            title.className = 'simplotheading';
            plotPanel.appendChild(title);
            plot = document.createElement('div');
            plot.id = 'currentDRIPlot';
            plot.style.width = '425px';
            plot.style.height = '200px';
            plotPanel.appendChild(plot);
            plotHandles.push(
               $.jqplot('currentDRIPlot', [iStim_DRI_nA], jQuery.extend(true, {}, graphJqplot.defaultOptions(params), {
                    axes: {
                        xaxis: {label:'Time (ms)'},
                        yaxis: {label:'Current (nA)'},
                    },
                    series: [
                        {label: 'I<sub>stim</sub>', color: 'black'},
                    ],
            })));
            graphJqplot.bindDataCapture('#currentDRIPlot', currentDRIDataTable, title.innerHTML, 'Time');
            graphJqplot.bindCursorTooltip('#currentDRIPlot', 'Time', 'ms', 'nA');

            if (result.terminationReason === 'Timeout') {
                t0 = result.t_f;
                y0 = result.y_f;
                window.setTimeout(updateSim, 0);
            } else {
                console.log('Total time: ' + 
                        (new Date().getTime() - startTime));
                debugPanel = document.getElementById('debugPanel');
                //debugPanel.innerHTML = 'hello world';
            }
        }

        window.setTimeout(updateSim, 0);
    }

   
    function reset(params) {
        controlsPanel.innerHTML = '';
        controls = simcontrols.controls(controlsPanel, params, layout);
        runSimulation();
    }

    function resetToUnmodulatedSwim() {
        reset(paramsUnmodulatedSwim);
    }
    
    function resetToModulatedSwim() {
        reset(paramsModulatedSwim);
    }
    
    function resetToIsolatedCells() {
        reset(paramsIsolatedCells);
    }


    function clearDataTables() {
        voltageC2DataTable.innerHTML = '';
        voltageC2DataTable.style.display = 'none';

        currentC2DataTable.innerHTML = '';
        currentC2DataTable.style.display = 'none';

        voltageDSIDataTable.innerHTML = '';
        voltageDSIDataTable.style.display = 'none';

        currentDSIDataTable.innerHTML = '';
        currentDSIDataTable.style.display = 'none';

        voltageVSIDataTable.innerHTML = '';
        voltageVSIDataTable.style.display = 'none';

        currentVSIDataTable.innerHTML = '';
        currentVSIDataTable.style.display = 'none';

        voltageDRIDataTable.innerHTML = '';
        voltageDRIDataTable.style.display = 'none';

        currentDRIDataTable.innerHTML = '';
        currentDRIDataTable.style.display = 'none';
    }


    (document.getElementById('TritoniaRunButton')
        .addEventListener('click', runSimulation, false));
    (document.getElementById('TritoniaUnmodulatedSwimResetButton')
        .addEventListener('click', resetToUnmodulatedSwim, false));
    (document.getElementById('TritoniaModulatedSwimResetButton')
        .addEventListener('click', resetToModulatedSwim, false));
    (document.getElementById('TritoniaIsolatedCellsResetButton')
        .addEventListener('click', resetToIsolatedCells, false));
    (document.getElementById('TritoniaClearDataButton')
        .addEventListener('click', clearDataTables, false));
    

    // make the enter key run the simulation  
    controlsPanel.addEventListener('keydown',  
        function (evt, element) {
            if (evt.keyCode === 13) { // enter was pressed 
                controls.triggerRead();
                runSimulation();
                return false;
            }
        }, true);

    resetToModulatedSwim();
    clearDataTables();

}, false);

