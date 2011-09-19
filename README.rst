==========
JSNeuroSim
==========

This project contains a series of simulations in JavaScript
that can be used to teach students about neurophysiology.  

Several simulations can be found inside of the simulations directory, including:

 * A simulation of a patch clamp of a single sodium channel

 * A simulation of a current clamp of a single compartment neuron with
   Hodgekin and Huxley conductances.

 * A simulation of a single compartment neuron with a passive membrane with 
   leak channels.  

 * A simulation of a passive cable.  

We plan to add several more simulations by the end October of 2011.   

There are also several components that may be useful for other projects:

 * An ODE integrator (using a 4th-5th order Dormand-Prince embedded Runge-Kutta
   algorithm with variable step size) that supports instantaneous changes and 
   resets of state variables.  

 * A wrapper around the ODE integrator for models composed of multiple 
   discrete components, for example neurons and synapses.  This allows you
   to build and test the components independently, and then combine them
   once they are working together.  

 * Simple components for a passive membrane, current pulse, Hodgekin and Huxley
   sodium and potassium current, integrate and fire neuron, shunt current, and
   synapse (the latter three are based on the model in CTMKF2007_).

To see the current code at work, download the project and open 
one of the html files in the simulation folder in a browser with JavaScript 
enabled.  

.. [CTMKF2007] Calin-Jageman RJ, Tunstall MJ, Mensh BD, Katz PS, Frost WN.
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
