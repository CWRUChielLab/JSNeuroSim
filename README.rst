==========
JSNeuroSim
==========

This project will eventually contain a series of simulations in JavaScript
that can be used to teach students about neurophysiology.  

At the moment it is still under construction, but it contains a few components 
that might be useful to others:

 * A basic ODE integrator (4th order Runge-Kutta, fixed step size) that 
   supports instantaneous changes and resets of state variables.  

 * A wrapper around the ODE integrator for models composed of multiple 
   discrete components, for example neurons and synapses.  This allows you
   to build and test the components independently, and then combine them
   once they are working together.  

 * Simple components for a passive membrane, current pulse, integrate and fire
   neuron, shunt current, and synapse (the latter three are based on the model
   in CRJ2007_).

To see the current code at work, download the project and open 
integration_tests/electrophys.html in a browser with JavaScript enabled.  

.. [CRJ2007] Calin-Jageman RJ, Tunstall MJ, Mensh BD, Katz PS, Frost WN.
   Parameter Space Analysis Suggests Multi-Site Plasticity Contributes to Motor
   Pattern Initiation in Tritonia. Journal of Neurophysiology 2007
   Oct;98(4):2382 -2398. http://jn.physiology.org/content/98/4/2382.short

License
=======

Copyright 2011 Kendrick Shaw

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
