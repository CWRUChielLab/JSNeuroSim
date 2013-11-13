/*jslint browser: true */
/*global ode: true, graph: true, simcontrols: true, electrophys: true, 
   componentModel: true */

// wait until the document has loaded
window.addEventListener('load', function () {
    'use strict';

    var layoutSwim, layoutHiDi,
		controlsPanel, controls, dataPanel, 
        voltageSDataTable, touchStimDataTable,
		voltageC2DataTable, currentC2DataTable, 
		voltageDSIDataTable, currentDSIDataTable,
        voltageVSIDataTable, currentVSIDataTable, 
		voltageDRIDataTable, currentDRIDataTable,
		voltageDFNDataTable, currentDFNDataTable,
		voltageVFNDataTable, currentVFNDataTable,
		bodyAngleDataTable,
        tMax = 600000e-3,
        paramsUnmodulatedSwim, 
        paramsModulatedSwim, modulation,
        paramsIsolatedCells,
		paramsHiDi,
        plotHandles = [],
        currentRunNumber = 0,
		plotTag = 'swim'; 

    // set up the controls for the passive membrane simulation
    paramsUnmodulatedSwim = { 
        pulseStart_ms_S: { label: 'Stimulus delay', units: 'ms', 
            defaultVal: 500, minVal: 0, maxVal: tMax / 1e-3 },
        pulseHeight_nA_S: { label: 'Stimulus current', units: 'nA', 
            defaultVal: 1, minVal: -1000, maxVal: 1000 },
        pulseWidth_ms_S: { label: 'Pulse duration', units: 'ms', 
            defaultVal: 1000, minVal: 0, maxVal: tMax / 1e-3 },
        isi_ms_S: { label: 'Inter-stimulus interval', units: 'ms', 
            defaultVal: 80, minVal: 0, maxVal: tMax / 1e-3 },
        numPulses_S: { label: 'Number of pulses', units: '', 
            defaultVal: 1, minVal: 0, maxVal: 100 },
         
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
            defaultVal: 0, minVal: -1000, maxVal: 1000 },
        pulseWidth_ms_DRI: { label: 'Pulse duration', units: 'ms', 
            defaultVal: 20, minVal: 0, maxVal: tMax / 1e-3 },
        isi_ms_DRI: { label: 'Inter-stimulus interval', units: 'ms', 
            defaultVal: 80, minVal: 0, maxVal: tMax / 1e-3 },
        numPulses_DRI: { label: 'Number of pulses', units: '', 
            defaultVal: 10, minVal: 0, maxVal: 100 },
			
		pulseStart_ms_DFN: { label: 'Stimulus delay', units: 'ms', 
            defaultVal: 5000, minVal: 0, maxVal: tMax / 1e-3 },
        pulseHeight_nA_DFN: { label: 'Stimulus current', units: 'nA', 
            defaultVal: 0, minVal: -1000, maxVal: 1000 },
        pulseWidth_ms_DFN: { label: 'Pulse duration', units: 'ms', 
            defaultVal: 20, minVal: 0, maxVal: tMax / 1e-3 },
        isi_ms_DFN: { label: 'Inter-stimulus interval', units: 'ms', 
            defaultVal: 80, minVal: 0, maxVal: tMax / 1e-3 },
        numPulses_DFN: { label: 'Number of pulses', units: '', 
            defaultVal: 10, minVal: 0, maxVal: 100 },
			
		pulseStart_ms_VFN: { label: 'Stimulus delay', units: 'ms', 
            defaultVal: 5000, minVal: 0, maxVal: tMax / 1e-3 },
        pulseHeight_nA_VFN: { label: 'Stimulus current', units: 'nA', 
            defaultVal: 0, minVal: -1000, maxVal: 1000 },
        pulseWidth_ms_VFN: { label: 'Pulse duration', units: 'ms', 
            defaultVal: 20, minVal: 0, maxVal: tMax / 1e-3 },
        isi_ms_VFN: { label: 'Inter-stimulus interval', units: 'ms', 
            defaultVal: 80, minVal: 0, maxVal: tMax / 1e-3 },
        numPulses_VFN: { label: 'Number of pulses', units: '', 
            defaultVal: 10, minVal: 0, maxVal: 100 },

        totalDuration_ms: { label: 'Total duration', units: 'ms', 
            defaultVal: 50000, minVal: 0, maxVal: tMax / 1e-3 },
        
        V_init_mV_S: { label: 'Initial membrane potential', units: 'mV', 
            defaultVal: -48, minVal: -1000, maxVal: 1000 },
        C_nF_S: { label: 'Membrane capacitance', units: 'nF', 
            defaultVal: 2.27, minVal: 0.01, maxVal: 100 },
        g_leak_uS_S: { label: 'Leak conductance', units: '\u00B5S', 
            defaultVal: .055, minVal: 0.01, maxVal: 100 },
        E_leak_mV_S: { label: 'Leak potential', units: 'mV', 
            defaultVal: -48, minVal: -1000, maxVal: 1000 },
        theta_ss_mV_S: { label: 'Resting threshold', units: 'mV', 
            defaultVal: -34, minVal: -1000, maxVal: 1000 },
        theta_r_mV_S: { label: 'Refractory threshold', units: 'mV', 
            defaultVal: 0, minVal: -1000, maxVal: 1000 },
        theta_tau_ms_S: { label: 'Refractory time constant', units: 'ms', 
            defaultVal: 20, minVal: 0.1, maxVal: 1000000 },
        Ks_S: { label: 'Static gain', units: 'nA/mN',
            defaultVal: 0.2, minVal: 0, maxVal: 100},
        Kd_positive_S: { label: 'Positive dynamic gain', units: 'pC/mN',
            defaultVal: 14, minVal: 0, maxVal: 10000},
        Kd_negative_S: { label: 'Negative dynamic gain', units: 'pC/mN',
            defaultVal: 0, minVal: -10000, maxVal: 10000},
            
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
			
		V_init_mV_DFN: { label: 'Initial membrane potential', units: 'mV', 
            defaultVal: -50, minVal: -1000, maxVal: 1000 },
        C_nF_DFN: { label: 'Membrane capacitance', units: 'nF', 
            defaultVal: 2, minVal: 0.01, maxVal: 100 },
        g_leak_uS_DFN: { label: 'Leak conductance', units: '\u00B5S', 
            defaultVal: 0.05, minVal: 0.01, maxVal: 100 },
        E_leak_mV_DFN: { label: 'Leak potential', units: 'mV', 
            defaultVal: -50, minVal: -1000, maxVal: 1000 },
        theta_ss_mV_DFN: { label: 'Resting threshold', units: 'mV', 
            defaultVal: -34, minVal: -1000, maxVal: 1000 },
        theta_r_mV_DFN: { label: 'Refractory threshold', units: 'mV', 
            defaultVal: 0, minVal: -1000, maxVal: 1000 },
        theta_tau_ms_DFN: { label: 'Refractory time constant', units: 'ms', 
            defaultVal: 10, minVal: 0.1, maxVal: 1000000 },
        W_Fast_uS_DFN: { label: 'Fast undershoot conductance', 
            units: '\u00B5S', defaultVal: 0.3, minVal: 0, maxVal: 100 },
        E_Fast_mV_DFN: { label: 'Fast undershoot potential', units: 'mV', 
            defaultVal: -80, minVal: -1000, maxVal: 1000 },
        tau_open_Fast_ms_DFN: { units: 'ms', 
            label: 'Fast undershoot opening time constant', 
            defaultVal: 10, minVal: 0.1, maxVal: 1000000 },
        tau_close_Fast_ms_DFN: { units: 'ms', 
            label: 'Fast undershoot closing time constant', 
            defaultVal: 25, minVal: 0.1, maxVal: 1000000 },
			
		V_init_mV_VFN: { label: 'Initial membrane potential', units: 'mV', 
            defaultVal: -50, minVal: -1000, maxVal: 1000 },
        C_nF_VFN: { label: 'Membrane capacitance', units: 'nF', 
            defaultVal: 2, minVal: 0.01, maxVal: 100 },
        g_leak_uS_VFN: { label: 'Leak conductance', units: '\u00B5S', 
            defaultVal: 0.05, minVal: 0.01, maxVal: 100 },
        E_leak_mV_VFN: { label: 'Leak potential', units: 'mV', 
            defaultVal: -50, minVal: -1000, maxVal: 1000 },
        theta_ss_mV_VFN: { label: 'Resting threshold', units: 'mV', 
            defaultVal: -34, minVal: -1000, maxVal: 1000 },
        theta_r_mV_VFN: { label: 'Refractory threshold', units: 'mV', 
            defaultVal: 0, minVal: -1000, maxVal: 1000 },
        theta_tau_ms_VFN: { label: 'Refractory time constant', units: 'ms', 
            defaultVal: 10, minVal: 0.1, maxVal: 1000000 },
        W_Fast_uS_VFN: { label: 'Fast undershoot conductance', 
            units: '\u00B5S', defaultVal: 0.3, minVal: 0, maxVal: 100 },
        E_Fast_mV_VFN: { label: 'Fast undershoot potential', units: 'mV', 
            defaultVal: -80, minVal: -1000, maxVal: 1000 },
        tau_open_Fast_ms_VFN: { units: 'ms', 
            label: 'Fast undershoot opening time constant', 
            defaultVal: 10, minVal: 0.1, maxVal: 1000000 },
        tau_close_Fast_ms_VFN: { units: 'ms', 
            label: 'Fast undershoot closing time constant', 
            defaultVal: 25, minVal: 0.1, maxVal: 1000000 },
			
		W_E1_uS_StoDRI: { label: 'E1 conductance', 
            units: '\u00B5S', defaultVal: 0.0056, minVal: 0, maxVal: 100 },
        E_E1_mV_StoDRI: { label: 'E1 reversal potential', units: 'mV', 
            defaultVal: 10, minVal: -1000, maxVal: 1000 },
        tau_open_E1_ms_StoDRI: { units: 'ms', 
            label: 'E1 opening time constant', 
            defaultVal: 25, minVal: 0.1, maxVal: 1000000 },
        tau_close_E1_ms_StoDRI: { units: 'ms', 
            label: 'E1 closing time constant', 
            defaultVal: 15000, minVal: 0.1, maxVal: 1000000 },
			
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
			
		W_E1_uS_DSItoDFN: { label: 'E1 conductance', 
            units: '\u00B5S', defaultVal: 0.054, minVal: 0, maxVal: 100 },
        E_E1_mV_DSItoDFN: { label: 'E1 reversal potential', units: 'mV', 
            defaultVal: 10, minVal: -1000, maxVal: 1000 },
        tau_open_E1_ms_DSItoDFN: { units: 'ms', 
            label: 'E1 opening time constant', 
            defaultVal: 10, minVal: 0.1, maxVal: 1000000 },
        tau_close_E1_ms_DSItoDFN: { units: 'ms', 
            label: 'E1 closing time constant', 
            defaultVal: 370, minVal: 0.1, maxVal: 1000000 },
			
		W_E1_uS_VSItoVFN: { label: 'E1 conductance', 
            units: '\u00B5S', defaultVal: 0.054, minVal: 0, maxVal: 100 },
        E_E1_mV_VSItoVFN: { label: 'E1 reversal potential', units: 'mV', 
            defaultVal: 10, minVal: -1000, maxVal: 1000 },
        tau_open_E1_ms_VSItoVFN: { units: 'ms', 
            label: 'E1 opening time constant', 
            defaultVal: 10, minVal: 0.1, maxVal: 1000000 },
        tau_close_E1_ms_VSItoVFN: { units: 'ms', 
            label: 'E1 closing time constant', 
            defaultVal: 370, minVal: 0.1, maxVal: 1000000 },
        W_E2_uS_VSItoVFN: { label: 'E2 conductance', 
            units: '\u00B5S', defaultVal: 0.0007, minVal: 0, maxVal: 100 },
        E_E2_mV_VSItoVFN: { label: 'E2 reversal potential', units: 'mV', 
            defaultVal: 10, minVal: -1000, maxVal: 1000 },
        tau_open_E2_ms_VSItoVFN: { units: 'ms', 
            label: 'E2 opening time constant', 
            defaultVal: 2200, minVal: 0.1, maxVal: 1000000 },
        tau_close_E2_ms_VSItoVFN: { units: 'ms', 
            label: 'E2 closing time constant', 
            defaultVal: 2200, minVal: 0.1, maxVal: 1000000 },
		
		sigHeight: { label: 'Body angle sigmoid height', units: 'mV',
			defaultVal: 200, minVal: 0, maxVal: 300},
		beta_ventral: { label: 'Ventral neuron beta value', units: 'mV',
			defaultVal: -44, minVal: 0, maxVal: 1000 },
		gamma_ventral: { label: 'Ventral neuron gamma value', units: 'mV',
			defaultVal: 1, minVal: 0, maxVal: 1000 },
		beta_dorsal: { label: 'Dorsal neuron beta value', units: 'mV',
			defaultVal: -43, minVal: 0, maxVal: 1000 },
		gamma_dorsal: { label: 'Dorsal neuron gamma value', units: 'mV',
			defaultVal: 1, minVal: 0, maxVal: 1000 }
    };

	// Hi Di Treatment Parameters
	paramsHiDi = JSON.parse(JSON.stringify(paramsUnmodulatedSwim));
	paramsHiDi.sigHeight.defaultVal = 90;
	paramsHiDi.totalDuration_ms.defaultVal = 10000;
	
	// Make all neurons less sensitive to firing
	paramsHiDi.theta_ss_mV_S.defaultVal = -20;
	paramsHiDi.theta_ss_mV_DRI.defaultVal = -27;
	paramsHiDi.theta_ss_mV_DSI.defaultVal = -20;
	paramsHiDi.theta_ss_mV_VSI.defaultVal = -20;
	paramsHiDi.theta_ss_mV_C2.defaultVal = -10;
	paramsHiDi.theta_ss_mV_DFN.defaultVal = -20;
	paramsHiDi.theta_ss_mV_VFN.defaultVal = -20;
	
	paramsHiDi.W_E1_uS_DSItoDFN.defaultVal = .02
	paramsHiDi.W_E1_uS_VSItoVFN.defaultVal = .03
	paramsHiDi.beta_ventral.defaultVal = -40;
	paramsHiDi.beta_dorsal.defaultVal = -40;
	
	// Current setup for good results
	paramsHiDi.pulseStart_ms_DRI.defaultVal = 500;  // cell A
	paramsHiDi.pulseHeight_nA_DRI.defaultVal = 3;
	paramsHiDi.pulseWidth_ms_DRI.defaultVal = 200;
	paramsHiDi.isi_ms_DRI.defaultVal = 800;  
	paramsHiDi.numPulses_DRI.defaultVal = 0;
	
	paramsHiDi.pulseHeight_nA_C2.defaultVal = 6;   // cell B
	paramsHiDi.pulseWidth_ms_C2.defaultVal = 1000;
	paramsHiDi.isi_ms_C2.defaultVal = 800;  
	paramsHiDi.numPulses_C2.defaultVal = 0;
	
	paramsHiDi.pulseStart_ms_VFN.defaultVal = 500;   // cell C
	paramsHiDi.pulseHeight_nA_VFN.defaultVal = 5;
	paramsHiDi.pulseWidth_ms_VFN.defaultVal = 1200;
	paramsHiDi.isi_ms_VFN.defaultVal = 800;  
	paramsHiDi.numPulses_VFN.defaultVal = 0;
	
	paramsHiDi.pulseHeight_nA_S.defaultVal = 1.7;   // cell D
	paramsHiDi.pulseWidth_ms_S.defaultVal = 200;
	paramsHiDi.isi_ms_S.defaultVal = 800;  
	paramsHiDi.numPulses_S.defaultVal = 0;
	
	paramsHiDi.pulseStart_ms_VSI.defaultVal = 200;   // cell E
	paramsHiDi.pulseHeight_nA_VSI.defaultVal = 5;
	paramsHiDi.pulseWidth_ms_VSI.defaultVal = 2000;
	paramsHiDi.isi_ms_VSI.defaultVal = 800;  
	paramsHiDi.numPulses_VSI.defaultVal = 0;
	
	paramsHiDi.pulseHeight_nA_DSI.defaultVal = 5;   // cell F
	paramsHiDi.pulseWidth_ms_DSI.defaultVal = 1000;
	paramsHiDi.isi_ms_DSI.defaultVal = 800;  
	paramsHiDi.numPulses_DSI.defaultVal = 0;
	
	paramsHiDi.pulseStart_ms_DFN.defaultVal = 500;   // cell G
	paramsHiDi.pulseHeight_nA_DFN.defaultVal = 5;
	paramsHiDi.pulseWidth_ms_DFN.defaultVal = 1200;
	paramsHiDi.isi_ms_DFN.defaultVal = 800;  
	paramsHiDi.numPulses_DFN.defaultVal = 0;
	
	
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



    layoutSwim = [
		['Touch Stimulus', ['pulseStart_ms_S', 'pulseHeight_nA_S', 
            'pulseWidth_ms_S', 'isi_ms_S', 'numPulses_S']],
        ['Simulation Settings', ['totalDuration_ms']],
        ['Cell A Parameters', ['V_init_mV_DRI', 'C_nF_DRI', 'g_leak_uS_DRI', 
            'E_leak_mV_DRI', 'theta_ss_mV_DRI', 'theta_r_mV_DRI', 
			'theta_tau_ms_DRI']],
		['Cell B Parameters', ['V_init_mV_C2', 'C_nF_C2', 'g_leak_uS_C2', 
            'E_leak_mV_C2', 'theta_ss_mV_C2', 'theta_r_mV_C2', 
			'theta_tau_ms_C2']],
		['Cell C Parameters', ['V_init_mV_VFN', 'C_nF_VFN', 'g_leak_uS_VFN', 
            'E_leak_mV_VFN', 'theta_ss_mV_VFN', 'theta_r_mV_VFN', 
			'theta_tau_ms_VFN']],
		['Cell D Properties', ['V_init_mV_S', 'C_nF_S', 'g_leak_uS_S', 
			'E_leak_mV_S', 'theta_ss_mV_S', 'theta_r_mV_S', 
			'theta_tau_ms_S']],
        ['Cell E Parameters', ['V_init_mV_VSI', 'C_nF_VSI', 'g_leak_uS_VSI',
            'E_leak_mV_VSI', 'theta_ss_mV_VSI', 'theta_r_mV_VSI',
            'theta_tau_ms_VSI']],
        ['Cell F Parameters', ['V_init_mV_DSI', 'C_nF_DSI', 'g_leak_uS_DSI', 
            'E_leak_mV_DSI', 'theta_ss_mV_DSI', 'theta_r_mV_DSI',
            'theta_tau_ms_DSI']],
		['Cell G Parameters', ['V_init_mV_DFN', 'C_nF_DFN', 'g_leak_uS_DFN', 
            'E_leak_mV_DFN', 'theta_ss_mV_DFN', 'theta_r_mV_DFN',
            'theta_tau_ms_DFN']]
    ];
	
	layoutHiDi = [
		['Cell A Current Clamp', ['pulseStart_ms_DRI', 'pulseHeight_nA_DRI', 
            'pulseWidth_ms_DRI', 'isi_ms_DRI', 'numPulses_DRI']],
        ['Cell B Current Clamp', ['pulseStart_ms_C2', 'pulseHeight_nA_C2', 
            'pulseWidth_ms_C2', 'isi_ms_C2', 'numPulses_C2']],
		['Cell C Current Clamp', ['pulseStart_ms_VFN', 'pulseHeight_nA_VFN', 
            'pulseWidth_ms_VFN', 'isi_ms_VFN', 'numPulses_VFN']],
		['Cell D Current Clamp', ['pulseStart_ms_S', 'pulseHeight_nA_S', 
            'pulseWidth_ms_S', 'isi_ms_S', 'numPulses_S']],
		['Cell E Current Clamp', ['pulseStart_ms_VSI', 'pulseHeight_nA_VSI', 
            'pulseWidth_ms_VSI', 'isi_ms_VSI', 'numPulses_VSI']],
        ['Cell F Current Clamp', ['pulseStart_ms_DSI', 'pulseHeight_nA_DSI', 
            'pulseWidth_ms_DSI', 'isi_ms_DSI', 'numPulses_DSI']],
		['Cell G Current Clamp', ['pulseStart_ms_DFN', 'pulseHeight_nA_DFN', 
            'pulseWidth_ms_DFN', 'isi_ms_DFN', 'numPulses_DFN']],	
        ['Simulation Settings', ['totalDuration_ms']]
    ];
    controlsPanel = document.getElementById('TritoniaControls');

    // prepare tables for displaying captured data points
    dataPanel = document.getElementById('TritoniaData');
    dataPanel.className = 'datapanel';

    voltageDRIDataTable = document.createElement('table');  // cell A
    voltageDRIDataTable.className = 'datatable';
    dataPanel.appendChild(voltageDRIDataTable);

    currentDRIDataTable = document.createElement('table');
    currentDRIDataTable.className = 'datatable';
    dataPanel.appendChild(currentDRIDataTable);

    voltageC2DataTable = document.createElement('table');  // cell B
    voltageC2DataTable.className = 'datatable';
    dataPanel.appendChild(voltageC2DataTable);

    currentC2DataTable = document.createElement('table'); 
    currentC2DataTable.className = 'datatable';
    dataPanel.appendChild(currentC2DataTable);
	
	voltageVFNDataTable = document.createElement('table');  // cell C
    voltageVFNDataTable.className = 'datatable';
    dataPanel.appendChild(voltageVFNDataTable);

    currentVFNDataTable = document.createElement('table');
    currentVFNDataTable.className = 'datatable';
    dataPanel.appendChild(currentVFNDataTable);
	
	voltageSDataTable = document.createElement('table');   // cell D
    voltageSDataTable.className = 'datatable';
    dataPanel.appendChild(voltageSDataTable);
	
	touchStimDataTable = document.createElement('table');
    touchStimDataTable.className = 'datatable';
    dataPanel.appendChild(touchStimDataTable);
	
	voltageVSIDataTable = document.createElement('table');  // cell E
    voltageVSIDataTable.className = 'datatable';
    dataPanel.appendChild(voltageVSIDataTable);

    currentVSIDataTable = document.createElement('table');
    currentVSIDataTable.className = 'datatable';
    dataPanel.appendChild(currentVSIDataTable);

    voltageDSIDataTable = document.createElement('table');  // cell F
    voltageDSIDataTable.className = 'datatable';
    dataPanel.appendChild(voltageDSIDataTable);

    currentDSIDataTable = document.createElement('table');
    currentDSIDataTable.className = 'datatable';
    dataPanel.appendChild(currentDSIDataTable);
	
    voltageDFNDataTable = document.createElement('table');  // cell G
    voltageDFNDataTable.className = 'datatable';
    dataPanel.appendChild(voltageDFNDataTable);

    currentDFNDataTable = document.createElement('table');
    currentDFNDataTable.className = 'datatable';
    dataPanel.appendChild(currentDFNDataTable);
	
	bodyAngleDataTable = document.createElement('table');  // body angle
    bodyAngleDataTable.className = 'datatable';
    dataPanel.appendChild(bodyAngleDataTable);


    // simulate and plot the tritonia swim CPG from Calin-Jageman et al 2007
    function runSimulation() {
        var params, plot, plotPanel, title,
            model, result,
            S, pulseTrainS,
            v_S, v_S_mV, touchStim_S, touchStim_S_mN,
            C2, C2Fast, C2Med, C2Slow, pulseTrainC2,
            v_C2, v_C2_mV, iStim_C2, iStim_C2_nA,
            DSI, DSIShunt, DSIFast, DSISlow, DSIToDSI_E1, pulseTrainDSI,
            v_DSI, v_DSI_mV, iStim_DSI, iStim_DSI_nA,
            VSI, VSIShunt, VSIFast, VSISlow, VSIToVSI_E1, pulseTrainVSI,
            v_VSI, v_VSI_mV, iStim_VSI, iStim_VSI_nA,
            DRI, DRIFast, pulseTrainDRI,
            v_DRI, v_DRI_mV, iStim_DRI, iStim_DRI_nA,
			DFN, DFNFast, pulseTrainDFN,
			v_DFN, v_DFN_mV, iStim_DFN, iStim_DFN_nA,
			VFN, VFNFast, pulseTrainVFN,
			v_VFN, v_VFN_mV, iStim_VFN, iStim_VFN_nA,
			StoDRI_E1,
            C2toDSI_E1, C2toDSI_I1, C2toDSI_I2, 
            C2toVSI_E1, C2toVSI_I1, C2toVSI_I2, 
            DSItoC2_E1, DSItoC2_E2, 
            DSItoVSI_E1, DSItoVSI_I1, DSItoVSI_I2, 
            VSItoC2_I1, 
            VSItoDSI_I1, VSItoDSI_I2, 
            DRItoDSI_E1, 
			DSItoDFN_E1, DSItoDFN_E2,
			VSItoVFN_E1, VSItoVFN_E2,
			slugBody, bodyAngle, bodyAngle_degree,
            startTime = new Date().getTime(),
            t0, y0, runNumber;
       
        params = controls.values;
        model = componentModel.componentModel();

        // create the S neuron
        S = electrophys.gettingIFNeuron(model, { 
            V_rest: params.V_init_mV_S * 1e-3, 
            C: params.C_nF_S * 1e-9, 
            g_leak: params.g_leak_uS_S * 1e-6, 
            E_leak: params.E_leak_mV_S * 1e-3, 
            theta_ss: params.theta_ss_mV_S * 1e-3, 
            theta_r: params.theta_r_mV_S * 1e-3, 
            theta_tau: params.theta_tau_ms_S * 1e-3
        });
		pulseTrainS = electrophys.pulseTrain({
            start: 1e-3 * params.pulseStart_ms_S, 
            width: params.pulseWidth_ms_S * 1e-3, 
            height: params.pulseHeight_nA_S * 1e-9,
            gap: params.isi_ms_S * 1e-3,
            num_pulses: params.numPulses_S
        });
        S.addCurrent(pulseTrainS);

        
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
       

	   DFN = electrophys.gettingIFNeuron(model, { 
            V_rest: params.V_init_mV_DFN * 1e-3, 
            C: params.C_nF_DFN * 1e-9, 
            g_leak: params.g_leak_uS_DFN * 1e-6, 
            E_leak: params.E_leak_mV_DFN * 1e-3, 
            theta_ss: params.theta_ss_mV_DFN * 1e-3, 
            theta_r: params.theta_r_mV_DFN * 1e-3, 
            theta_tau: params.theta_tau_ms_DFN * 1e-3 
        });
        DFNFast = electrophys.gettingSynapse(model, DFN, DFN, { 
            W: params.W_Fast_uS_DFN * 1e-6, 
            E_rev: params.E_Fast_mV_DFN * 1e-3, 
            tau_open: params.tau_open_Fast_ms_DFN * 1e-3, 
            tau_close: params.tau_close_Fast_ms_DFN * 1e-3, 
        });
		pulseTrainDFN = electrophys.pulseTrain({
            start: 1e-3 * params.pulseStart_ms_DFN, 
            width: params.pulseWidth_ms_DFN * 1e-3, 
            height: params.pulseHeight_nA_DFN * 1e-9,
            gap: params.isi_ms_DFN * 1e-3,
            num_pulses: params.numPulses_DFN
        });
        DFN.addCurrent(pulseTrainDFN);
		
		VFN = electrophys.gettingIFNeuron(model, { 
            V_rest: params.V_init_mV_VFN * 1e-3, 
            C: params.C_nF_VFN * 1e-9, 
            g_leak: params.g_leak_uS_VFN * 1e-6, 
            E_leak: params.E_leak_mV_VFN * 1e-3, 
            theta_ss: params.theta_ss_mV_VFN * 1e-3, 
            theta_r: params.theta_r_mV_VFN * 1e-3, 
            theta_tau: params.theta_tau_ms_VFN * 1e-3 
        });
        VFNFast = electrophys.gettingSynapse(model, VFN, VFN, { 
            W: params.W_Fast_uS_VFN * 1e-6, 
            E_rev: params.E_Fast_mV_VFN * 1e-3, 
            tau_open: params.tau_open_Fast_ms_VFN * 1e-3, 
            tau_close: params.tau_close_Fast_ms_VFN * 1e-3, 
        });
		pulseTrainVFN = electrophys.pulseTrain({
            start: 1e-3 * params.pulseStart_ms_VFN, 
            width: params.pulseWidth_ms_VFN * 1e-3, 
            height: params.pulseHeight_nA_VFN * 1e-9,
            gap: params.isi_ms_VFN * 1e-3,
            num_pulses: params.numPulses_VFN
        });
        VFN.addCurrent(pulseTrainVFN);
		
		// create the S to DRI synapse
        StoDRI_E1 = electrophys.gettingSynapse(model, S, DRI, { 
            W: params.W_E1_uS_StoDRI * 1e-6, 
            E_rev: params.E_E1_mV_StoDRI * 1e-3, 
            tau_open: params.tau_open_E1_ms_StoDRI * 1e-3, 
            tau_close: params.tau_close_E1_ms_StoDRI * 1e-3, 
        });
		
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
		
		// create the DSI to DFN synapse
        DSItoDFN_E1 = electrophys.gettingSynapse(model, DSI, DFN, { 
            W: params.W_E1_uS_DSItoDFN * 1e-6, 
            E_rev: params.E_E1_mV_DSItoDFN * 1e-3, 
            tau_open: params.tau_open_E1_ms_DSItoDFN * 1e-3, 
            tau_close: params.tau_close_E1_ms_DSItoDFN * 1e-3, 
        });
		
		// create the VSI to VFN synapse
        VSItoVFN_E1 = electrophys.gettingSynapse(model, VSI, VFN, { 
            W: params.W_E1_uS_VSItoVFN * 1e-6, 
            E_rev: params.E_E1_mV_VSItoVFN * 1e-3, 
            tau_open: params.tau_open_E1_ms_VSItoVFN * 1e-3, 
            tau_close: params.tau_close_E1_ms_VSItoVFN * 1e-3, 
        });
        VSItoVFN_E2 = electrophys.gettingSynapse(model, VSI, VFN, { 
            W: params.W_E2_uS_VSItoVFN * 1e-6, 
            E_rev: params.E_E2_mV_VSItoVFN * 1e-3, 
            tau_open: params.tau_open_E2_ms_VSItoVFN * 1e-3, 
            tau_close: params.tau_close_E2_ms_VSItoVFN * 1e-3, 
        });
		
		
		// Get the body angle
		slugBody = electrophys.slugBody(model, VFN, DFN, {
			sigHeight: params.sigHeight,
			beta_ventral: params.beta_ventral * 1e-3,
			gamma_ventral: params.gamma_ventral * 1e-3,
			beta_dorsal: params.beta_dorsal * 1e-3,
			gamma_dorsal: params.gamma_dorsal * 1e-3
		});
		
        // simulate them
        v_S_mV = [];
        touchStim_S_mN = [];
        v_C2_mV = [];
        iStim_C2_nA = [];
        v_DSI_mV = [];
        iStim_DSI_nA = [];
        v_VSI_mV = [];
        iStim_VSI_nA = [];
        v_DRI_mV = [];
        iStim_DRI_nA = [];
		v_DFN_mV = [];
		iStim_DFN_nA = [];
		v_VFN_mV = [];
		iStim_VFN_nA = [];
		bodyAngle_degree = [];

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
            
            v_S       = result.mapOrderedPairs(S.VWithSpikes);
            v_C2      = result.mapOrderedPairs(C2.VWithSpikes);
            v_DSI     = result.mapOrderedPairs(DSI.VWithSpikes);
            v_VSI     = result.mapOrderedPairs(VSI.VWithSpikes);
            v_DRI     = result.mapOrderedPairs(DRI.VWithSpikes);
			v_DFN	  = result.mapOrderedPairs(DFN.VWithSpikes);
			v_VFN	  = result.mapOrderedPairs(VFN.VWithSpikes);
            touchStim_S = result.mapOrderedPairs(pulseTrainS);
            iStim_C2  = result.mapOrderedPairs(pulseTrainC2);
            iStim_DSI = result.mapOrderedPairs(pulseTrainDSI);
            iStim_VSI = result.mapOrderedPairs(pulseTrainVSI);
            iStim_DRI = result.mapOrderedPairs(pulseTrainDRI);
			iStim_DFN = result.mapOrderedPairs(pulseTrainDFN);
			iStim_VFN = result.mapOrderedPairs(pulseTrainVFN);
			bodyAngle = result.mapOrderedPairs(slugBody.bodyAngle);

            // convert to the right units
            // each ordered pair consists of a time and another variable
            v_S_mV       = v_S_mV.concat(v_S.map             (function (v) {return [v[0] / 1e-3, v[1] / 1e-3];}));
            v_C2_mV      = v_C2_mV.concat(v_C2.map           (function (v) {return [v[0] / 1e-3, v[1] / 1e-3];}));
            v_DSI_mV     = v_DSI_mV.concat(v_DSI.map         (function (v) {return [v[0] / 1e-3, v[1] / 1e-3];}));
            v_VSI_mV     = v_VSI_mV.concat(v_VSI.map         (function (v) {return [v[0] / 1e-3, v[1] / 1e-3];}));
            v_DRI_mV     = v_DRI_mV.concat(v_DRI.map         (function (v) {return [v[0] / 1e-3, v[1] / 1e-3];}));
			v_DFN_mV     = v_DFN_mV.concat(v_DFN.map         (function (v) {return [v[0] / 1e-3, v[1] / 1e-3];}));
			v_VFN_mV     = v_VFN_mV.concat(v_VFN.map         (function (v) {return [v[0] / 1e-3, v[1] / 1e-3];}));
            touchStim_S_mN = touchStim_S_mN.concat(touchStim_S.map   (function (f) {return [f[0] / 1e-3, f[1] / 1e-9]}));
            iStim_C2_nA  = iStim_C2_nA.concat(iStim_C2.map   (function (i) {return [i[0] / 1e-3, i[1] / 1e-9]}));
            iStim_DSI_nA = iStim_DSI_nA.concat(iStim_DSI.map (function (i) {return [i[0] / 1e-3, i[1] / 1e-9]}));
            iStim_VSI_nA = iStim_VSI_nA.concat(iStim_VSI.map (function (i) {return [i[0] / 1e-3, i[1] / 1e-9]}));
            iStim_DRI_nA = iStim_DRI_nA.concat(iStim_DRI.map (function (i) {return [i[0] / 1e-3, i[1] / 1e-9]}));
			iStim_DFN_nA = iStim_DFN_nA.concat(iStim_DFN.map (function (i) {return [i[0] / 1e-3, i[1] / 1e-9]}));
			iStim_VFN_nA = iStim_VFN_nA.concat(iStim_VFN.map (function (i) {return [i[0] / 1e-3, i[1] / 1e-9]}));
			bodyAngle_degree = bodyAngle_degree.concat(bodyAngle.map (function (d) {return [d[0] / 1e-3, d[1]];}));

            // free resources from old plots
            while (plotHandles.length > 0) {
                plotHandles.pop().destroy();
            }

            // plot the results
            plotPanel = document.getElementById('TritoniaPlots');
            plotPanel.innerHTML = '';
			
			// Unlabelled touch stimuli (Cell D)
			if (plotTag == 'swim') {
				title = document.createElement('h4');
				title.innerHTML = 'Touch Stimulus';
				title.className = 'simplotheading';
				plotPanel.appendChild(title);
				plot = document.createElement('div');
				plot.id = 'touchStimPlot';
				plot.style.width = '425px';
				plot.style.height = '200px';
				plotPanel.appendChild(plot);
				plotHandles.push(
				   $.jqplot('touchStimPlot', [touchStim_S_mN], jQuery.extend(true, {}, graphJqplot.defaultOptions(params), {
						axes: {
							xaxis: {label:'Time (ms)'},
							yaxis: {label:'Force (N)'},
						},
						series: [
							{label: 'N', color: 'black'},
						],
				})));
				graphJqplot.bindDataCapture('#touchStimPlot', touchStimDataTable, title.innerHTML, 'Time');
				graphJqplot.bindCursorTooltip('#touchStimPlot', 'Time', 'ms', 'N');
			}

            // DRI Voltage (Cell A)
            title = document.createElement('h4');
            title.innerHTML = 'Cell A Membrane Potential';
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

            // DRI Current (Cell A)
			if (plotTag == 'HiDi') {
				title = document.createElement('h4');
				title.innerHTML = 'Cell A Stimulation Current';
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
			}

            // C2 Voltage (Cell B)
            title = document.createElement('h4');
            title.innerHTML = 'Cell B Membrane Potential';
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

            // C2 Current (Cell B)
			if (plotTag == 'HiDi') {
				title = document.createElement('h4');
				title.innerHTML = 'Cell B Stimulation Current';
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
			}
			
			// VFN Voltage (Cell C)
            title = document.createElement('h4');
            title.innerHTML = 'Cell C Membrane Potential';
            title.className = 'simplotheading';
            plotPanel.appendChild(title);
            plot = document.createElement('div');
            plot.id = 'voltageVFNPlot';
            plot.style.width = '425px';
            plot.style.height = '200px';
            plotPanel.appendChild(plot);
            plotHandles.push(
               $.jqplot('voltageVFNPlot', [v_VFN_mV], jQuery.extend(true, {}, graphJqplot.defaultOptions(params), {
                    axes: {
                        xaxis: {label:'Time (ms)'},
                        yaxis: {label:'Membrane Potential (mV)'},
                    },
                    series: [
                        {label: 'V<sub>m</sub>', color: 'black'},
                    ],
            })));
            graphJqplot.bindDataCapture('#voltageVFNPlot', voltageVFNDataTable, title.innerHTML, 'Time');
            graphJqplot.bindCursorTooltip('#voltageVFNPlot', 'Time', 'ms', 'mV');
			
			// VFN Current (Cell C)
			if (plotTag == 'HiDi') {
				title = document.createElement('h4');
				title.innerHTML = 'Cell C Stimulation Current';
				title.className = 'simplotheading';
				plotPanel.appendChild(title);
				plot = document.createElement('div');
				plot.id = 'currentVFNPlot';
				plot.style.width = '425px';
				plot.style.height = '200px';
				plotPanel.appendChild(plot);
				plotHandles.push(
				   $.jqplot('currentVFNPlot', [iStim_VFN_nA], jQuery.extend(true, {}, graphJqplot.defaultOptions(params), {
						axes: {
							xaxis: {label:'Time (ms)'},
							yaxis: {label:'Current (nA)'},
						},
						series: [
							{label: 'I<sub>stim</sub>', color: 'black'},
						],
				})));
				graphJqplot.bindDataCapture('#currentVFNPlot', currentVFNDataTable, title.innerHTML, 'Time');
				graphJqplot.bindCursorTooltip('#currentVFNPlot', 'Time', 'ms', 'nA');
			}
			
			// S Voltage (Cell D)
            title = document.createElement('h4');
            title.innerHTML = 'Cell D Membrane Potential';
            title.className = 'simplotheading';
            plotPanel.appendChild(title);
            plot = document.createElement('div');
            plot.id = 'voltageSPlot';
            plot.style.width = '425px';
            plot.style.height = '200px';
            plotPanel.appendChild(plot);
            plotHandles.push(
               $.jqplot('voltageSPlot', [v_S_mV], jQuery.extend(true, {}, graphJqplot.defaultOptions(params), {
                    axes: {
                        xaxis: {label:'Time (ms)'},
                        yaxis: {label:'Membrane Potential (mV)'},
                    },
                    series: [
                        {label: 'V<sub>m</sub>', color: 'black'},
                    ],
            })));
            graphJqplot.bindDataCapture('#voltageSPlot', voltageSDataTable, title.innerHTML, 'Time');
            graphJqplot.bindCursorTooltip('#voltageSPlot', 'Time', 'ms', 'mV');

            // S touch stimuli (Cell D)
			if (plotTag == 'HiDi') {
				title = document.createElement('h4');
				title.innerHTML = 'Cell D Stimulation Current';
				title.className = 'simplotheading';
				plotPanel.appendChild(title);
				plot = document.createElement('div');
				plot.id = 'touchStimPlot';
				plot.style.width = '425px';
				plot.style.height = '200px';
				plotPanel.appendChild(plot);
				plotHandles.push(
				   $.jqplot('touchStimPlot', [touchStim_S_mN], jQuery.extend(true, {}, graphJqplot.defaultOptions(params), {
						axes: {
							xaxis: {label:'Time (ms)'},
							yaxis: {label:'Current (nA)'},
						},
						series: [
							{label: 'I<sub>stim</sub>', color: 'black'},
						],
				})));
				graphJqplot.bindDataCapture('#touchStimPlot', touchStimDataTable, title.innerHTML, 'Time');
				graphJqplot.bindCursorTooltip('#touchStimPlot', 'Time', 'ms', 'nA');
			}
			
			// VSI Voltage (Cell E)
            title = document.createElement('h4');
            title.innerHTML = 'Cell E Membrane Potential';
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

            // VSI Current (Cell E)
			if (plotTag == 'HiDi') {
				title = document.createElement('h4');
				title.innerHTML = 'Cell E Stimulation Current';
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
			}
			
            // DSI Voltage (Cell F)
            title = document.createElement('h4');
            title.innerHTML = 'Cell F Membrane Potential';
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

            // DSI Current (Cell F)
			if (plotTag == 'HiDi') {
				title = document.createElement('h4');
				title.innerHTML = 'Cell F Stimulation Current';
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
			}
			
			// DFN Voltage (Cell G)
            title = document.createElement('h4');
            title.innerHTML = 'Cell G Membrane Potential';
            title.className = 'simplotheading';
            plotPanel.appendChild(title);
            plot = document.createElement('div');
            plot.id = 'voltageDFNPlot';
            plot.style.width = '425px';
            plot.style.height = '200px';
            plotPanel.appendChild(plot);
            plotHandles.push(
               $.jqplot('voltageDFNPlot', [v_DFN_mV], jQuery.extend(true, {}, graphJqplot.defaultOptions(params), {
                    axes: {
                        xaxis: {label:'Time (ms)'},
                        yaxis: {label:'Membrane Potential (mV)'},
                    },
                    series: [
                        {label: 'V<sub>m</sub>', color: 'black'},
                    ],
            })));
            graphJqplot.bindDataCapture('#voltageDFNPlot', voltageDFNDataTable, title.innerHTML, 'Time');
            graphJqplot.bindCursorTooltip('#voltageDFNPlot', 'Time', 'ms', 'mV');
			
			// DFN Current (Cell G)
			if (plotTag == 'HiDi') {
				title = document.createElement('h4');
				title.innerHTML = 'Cell G Stimulation Current';
				title.className = 'simplotheading';
				plotPanel.appendChild(title);
				plot = document.createElement('div');
				plot.id = 'currentDFNPlot';
				plot.style.width = '425px';
				plot.style.height = '200px';
				plotPanel.appendChild(plot);
				plotHandles.push(
				   $.jqplot('currentDFNPlot', [iStim_DFN_nA], jQuery.extend(true, {}, graphJqplot.defaultOptions(params), {
						axes: {
							xaxis: {label:'Time (ms)'},
							yaxis: {label:'Current (nA)'},
						},
						series: [
							{label: 'I<sub>stim</sub>', color: 'black'},
						],
				})));
				graphJqplot.bindDataCapture('#currentDFNPlot', currentDFNDataTable, title.innerHTML, 'Time');
				graphJqplot.bindCursorTooltip('#currentDFNPlot', 'Time', 'ms', 'nA');
			}
			
			// Body flexion angle plot
            title = document.createElement('h4');
            title.innerHTML = 'Body Flexion Angle';
            title.className = 'simplotheading';
            plotPanel.appendChild(title);
            plot = document.createElement('div');
            plot.id = 'angleDiffPlot';
            plot.style.width = '425px';
            plot.style.height = '200px';
            plotPanel.appendChild(plot);
            plotHandles.push(
               $.jqplot('angleDiffPlot', [bodyAngle_degree], jQuery.extend(true, {}, graphJqplot.defaultOptions(params), {
                    axes: {
                        xaxis: {label:'Time (ms)'},
                        yaxis: {
                            label:'Body angle (degrees)',
                            min: -90, max: 90,
                            numberTicks: 7,
                        },
                    },
                    series: [
                        {label: 'Body angle', color: 'black'},
                    ],
            })));
            graphJqplot.bindDataCapture('#angleDiffPlot', bodyAngleDataTable, title.innerHTML, 'Time');
            graphJqplot.bindCursorTooltip('#angleDiffPlot', 'Time', 'ms', 'Degrees');
			

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

   
    function reset(params, layout) {
        controlsPanel.innerHTML = '';
        controls = simcontrols.controls(controlsPanel, params, layout);
        runSimulation();
    }
	
	function resetToHiDi() {
		plotTag = 'HiDi';
        reset(paramsHiDi, layoutHiDi);
    }
    
    function resetToModulatedSwim() {
		plotTag = 'swim';
        reset(paramsModulatedSwim, layoutSwim);
    }
    

    function clearDataTables() {
        voltageSDataTable.innerHTML = '';
        voltageSDataTable.style.display = 'none';

        touchStimDataTable.innerHTML = '';
        touchStimDataTable.style.display = 'none';

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
		
        voltageDFNDataTable.innerHTML = '';
        voltageDFNDataTable.style.display = 'none';

        currentDFNDataTable.innerHTML = '';
        currentDFNDataTable.style.display = 'none';
		
        voltageVFNDataTable.innerHTML = '';
        voltageVFNDataTable.style.display = 'none';

        currentVFNDataTable.innerHTML = '';
        currentVFNDataTable.style.display = 'none';
		
		bodyAngleDataTable.innerHTML = '';
		bodyAngleDataTable.style.display = 'none';
    }


    (document.getElementById('TritoniaRunButton')
        .addEventListener('click', runSimulation, false));
	(document.getElementById('TritoniaHiDiResetButton')
        .addEventListener('click', resetToHiDi, false));
    (document.getElementById('TritoniaModulatedSwimResetButton')
        .addEventListener('click', resetToModulatedSwim, false));
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

