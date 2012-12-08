var Synthesizer = function(name){
	this.name = name;
	this.currentKey = 4;
	this.root = Math.pow(2,(1/12));
	this.baseFreq = 440;
	this.baseOctave = 4;
	this.currentOctave = 4;
	this.currentSteps = 0;
	this.currentFreq = this.baseFreq * Math.pow(this.root,this.currentSteps);


}

Synthesizer.prototype.init = function(){

	try {
		this.context = new webkitAudioContext();
	}
	catch(e){
		alert('web audio api is not supported yo!');
	}

	this.createNodes();
	this.createPianoModule();
	this.registerEventListeners();
	this.updateDynamicsCompressor();

	var self = this;

	for (var i=0;i<this.triangleTypeElemOsc1.children.length;i++){
		this.triangleTypeElemOsc1.children[i].addEventListener('click',function(e){
			self.setActiveWaveFormOsc1(e.target);
		});
	}
	for (var i=0;i<this.triangleTypeElemOsc2.children.length;i++){
		this.triangleTypeElemOsc2.children[i].addEventListener('click',function(e){
			self.setActiveWaveFormOsc2(e.target);
		});
	}
}



Synthesizer.prototype.registerEventListeners = function(){
	var self = this;
	this.attackInput.addEventListener('input', function(e){
		self.updateEnvelopeSettings();
	});
	this.decayInput.addEventListener('input', function(e){
		self.updateEnvelopeSettings();
	});
	this.sustainInput.addEventListener('input', function(e){
		self.updateEnvelopeSettings();
	});
	this.releaseInput.addEventListener('input', function(e){
		self.updateEnvelopeSettings();
	});
	this.detuneInput.addEventListener('input', function(e){
		self.updateDetuneValue();
	});
	this.lopassInput.addEventListener('input', function(e){
		self.updateLopassValue();
	});
	this.hipassInput.addEventListener('input', function(e){
		self.updateHipassValue();
	});
	this.hipassInput.addEventListener('input', function(e){
		self.updateHipassValue();
	});
	this.endGainInput.addEventListener('input', function(e){
		self.updateEndGain();
	});
	this.osc1GainInput.addEventListener('input', function(e){
		self.updateOscGain(e);
	});
	this.osc2GainInput.addEventListener('input', function(e){
		self.updateOscGain(e);
	});
}

Synthesizer.prototype.createPianoModule = function(){

	this.keyIsDown = [];
	document.addEventListener('keydown', keydown, false);
	document.addEventListener('keyup', keyup, false);

	var self = this;

	for (var i=0;i<200;i++){
		this.keyIsDown.push(false);
	}

	function keyup(e){
		e.preventDefault();
		e.stopPropagation();

		switch (e.keyCode){
			case 68 :
				doKeyCheck(e, "release");
				break;
			case 65 :
				doKeyCheck(e, "release");
				break;
			case 83 :
				doKeyCheck(e, "release");
				break;
			case 70 :
				doKeyCheck(e, "release");
				break;
			case 79 :
				doKeyCheck(e, "octave");
				break;
			case 76 :
				doKeyCheck(e, "octave");
				break;

			default :
				break;
		}

		function doKeyCheck(e, type){
			if (self.keyIsDown[e.keyCode]){
				self.keyIsDown[e.keyCode] = false;
				if (type == "release") self.releaseNote(e);
			}
		}
	}

	function keydown(e){
		e.preventDefault();
		e.stopPropagation();
		console.log(e.keyCode);
		switch (e.keyCode){
			case 68 :
				self.currentSteps = 5;
				doKeyCheck(e,"play");
				break;
			case 83 :
				self.currentSteps = 3;
				doKeyCheck(e,"play");
				break;
			case 65 :
				self.currentSteps = 2;
				doKeyCheck(e,"play");
				break;
			case 70 :

				doKeyCheck(e,"play");
				break;
			case 79 :
				doKeyCheck(e,"octave");
				break;
			case 76 :
				doKeyCheck(e,"octave");
				break;
			default :
				break;
		}

		function doKeyCheck(e, type){
			if (!self.keyIsDown[e.keyCode]){
				self.keyIsDown[e.keyCode] = true;
				if (type == "play") self.playNote(e);
				if (type == "octave"){
					self.changeOctave(e.keyCode);
				}
			}
		}
	}
}

Synthesizer.prototype.createNodes = function(){
	this.octaveElement = document.getElementById('octVal');
	this.envForm = document.getElementById('env-form');
	this.attackInput = this.envForm.elements['attack'];
	this.decayInput = this.envForm.elements['decay'];
	this.sustainInput = this.envForm.elements['sustain'];
	this.releaseInput = this.envForm.elements['release'];

	this.detuneForm = document.getElementById('detune_form');
	this.detuneInput = this.detuneForm.elements['detune'];

	this.osc1 = this.context.createOscillator();

	this.osc1Gain = this.context.createGainNode();
	this.osc2Gain = this.context.createGainNode();

	this.osc2 = this.context.createOscillator();
	this.osc2.frequency.value = this.baseFreq;
	this.osc2.detune.value = parseFloat(this.detuneInput.value);

	this.lopass = this.context.createBiquadFilter();
	this.lopass.type = 0;
	this.lopass.frequency.value = 440;

	this.hipass = this.context.createBiquadFilter();
	this.hipass.type = 1;
	this.hipass.frequency.value = 440;

	this.filterForm = document.getElementById('filter-form');
	this.lopassInput = this.filterForm.elements['lopass'];

	this.hipassInput = this.filterForm.elements['hipass'];

	var endGainForm = document.getElementById('endGain');
	this.endGainInput = endGainForm.elements['endgain'];

	var osc1GainForm = document.getElementById('osc1gainform');
	this.osc1GainInput = osc1GainForm.elements['osc1gain'];

	var osc2GainForm = document.getElementById('osc2gainform');
	this.osc2GainInput = osc2GainForm.elements['osc2gain'];

	this.dynamicCompressor = this.context.createDynamicsCompressor();

	this.endGain = this.context.createGainNode();
	this.endGain.gain.value = .5;

	this.Osc1envelope = this.context.createEnvelope(parseFloat(this.attackInput.value),parseFloat(this.decayInput.value),parseFloat(this.sustainInput.value),parseFloat(this.releaseInput.value));
	this.Osc2envelope = this.context.createEnvelope(parseFloat(this.attackInput.value),parseFloat(this.decayInput.value),parseFloat(this.sustainInput.value),parseFloat(this.releaseInput.value));

//	this.feedbackDelay = this.context.createFeedbackDelay(0.3, 0.1);

/*	this.osc1.connect(this.osc1Gain);
	this.osc2.connect(this.osc2Gain);

	this.osc1Gain.connect(this.Osc1envelope);
	this.osc2Gain.connect(this.Osc2envelope);

	this.Osc1envelope.connect(this.lopass);
	this.Osc2envelope.connect(this.lopass);

	this.lopass.connect(this.hipass);

	this.hipass.connect(this.dynamicCompressor);

	this.dynamicCompressor.connect(this.endGain);

	this.endGain.connect(this.context.destination);
*/

	this.customOscPair1 = this.context.createCustomOscillator(this.context);

	this.customOscPair1.connect(this.lopass);

	this.customOscPair2 = this.context.createCustomOscillator(this.context);

	this.customOscPair2.connect(this.lopass);

	this.customOscPair3 = this.context.createCustomOscillator(this.context);

	this.customOscPair3.connect(this.lopass);

	this.lopass.connect(this.hipass);

	this.hipass.connect(this.dynamicCompressor);

	this.dynamicCompressor.connect(this.endGain);

	this.endGain.connect(this.context.destination);



	this.triangleTypeElemOsc1 = document.getElementById('triangleTypeOsc1');

	this.triangleTypeElemOsc2 = document.getElementById('triangleTypeOsc2');

}


Synthesizer.prototype.updateDynamicsCompressor = function(){
	//this.dynamicCompressor.threshold.value = -20; // -100 0
	//this.dynamicCompressor.knee.value = 10; // 0 40
	//this.dynamicCompressor.ratio.value = 20; //1 20
	//this.dynamicCompressor.attack.value = 0.1; //0 1
	//this.dynamicCompressor.release.value = .013; //0 1
}


Synthesizer.prototype.updateOscGain = function(e){
	var target = e.target;

	if (target.id == 'osc1gain'){
		this.osc1Gain.gain.value = parseFloat(this.osc1GainInput.value);
	}else if (target.id == 'osc2gain'){
		this.osc2Gain.gain.value = parseFloat(this.osc2GainInput.value);
	}
}


Synthesizer.prototype.updateEndGain = function(e){
	this.endGain.gain.value = parseFloat(this.endGainInput.value);
}


Synthesizer.prototype.changeOctave = function(direction){
	if (direction == 79){
		if (this.currentOctave <= 7){
			this.currentOctave++;
			this.octaveElement.innerHTML = this.currentOctave;
		}
	}else if (direction == 76){
		if (this.currentOctave > 0){
			this.currentOctave--;
			this.octaveElement.innerHTML = this.currentOctave;
		}
	}
}


Synthesizer.prototype.setOscFreq = function(oscPairNr){
	var freq = this.baseFreq;
	var tempOctave = 0;
	var tempSteps = 0;
	if (this.currentOctave < this.baseOctave){
		tempOctave = this.currentOctave - this.baseOctave;
		tempSteps = 12 * tempOctave + this.currentSteps;
		console.log(tempSteps);
	}else if (this.currentOctave == 4){
		tempSteps = this.currentSteps;
	}else if (this.currentOctave > 4){
		tempOctave = this.currentOctave - this.baseOctave;
		tempSteps = 12 * tempOctave + this.currentSteps;
	}

	freq = this.baseFreq * Math.pow(this.root,tempSteps);
	if (oscPairNr == 1){
		this.customOscPair1.frequency(freq,freq);
	}
	if (oscPairNr == 2){
		this.customOscPair2.frequency(freq,freq);
	}
	if (oscPairNr == 3){
		this.customOscPair3.frequency(freq,freq);
	}
}

Synthesizer.prototype.updateDetuneValue = function(){
	this.customOscPair1.detune(parseFloat(this.detuneInput.value));
	this.customOscPair2.detune(parseFloat(this.detuneInput.value));
	this.customOscPair3.detune(parseFloat(this.detuneInput.value));

}

Synthesizer.prototype.updateLopassValue = function(){
	this.lopass.frequency.value = parseFloat(this.lopassInput.value);
};

Synthesizer.prototype.updateHipassValue = function(){
	this.hipass.frequency.value = parseFloat(this.hipassInput.value);
};

Synthesizer.prototype.updateEnvelopeSettings = function(e){
	var envValues = [];
	envValues.push(parseFloat(this.attackInput.value));
	envValues.push(parseFloat(this.decayInput.value));
	envValues.push(parseFloat(this.sustainInput.value));
	envValues.push(parseFloat(this.releaseInput.value));

	this.customOscPair1.setEnvelopeValues(envValues);
	this.customOscPair2.setEnvelopeValues(envValues);
	this.customOscPair3.setEnvelopeValues(envValues);
}

Synthesizer.prototype.playNote = function(e){

	console.log('play');

	if (!this.customOscPair1.isAssignedToKey()){
		this.setOscFreq(1);
		this.customOscPair1.trigger(e);
		console.log('osc1 play');
	}else if (!this.customOscPair2.isAssignedToKey()){
		this.setOscFreq(2);
		this.customOscPair2.trigger(e);
		console.log('osc2 play');
	}else if (!this.customOscPair3.isAssignedToKey()){
		this.setOscFreq(3);
		this.customOscPair3.trigger(e);
		console.log('osc3 play');
	}
}

Synthesizer.prototype.releaseNote = function(e){

	console.log('release');
	var now = this.context.currentTime;

	if (this.customOscPair1.currKeyCode == e.keyCode){
		this.customOscPair1.release(now);
		console.log('osc1 release');
	}if (this.customOscPair2.currKeyCode == e.keyCode){
		this.customOscPair2.release(now);
		console.log('osc2 release');
	}if (this.customOscPair3.currKeyCode == e.keyCode){
		this.customOscPair3.release(now);
		console.log('osc3 release');
	}
}

Synthesizer.prototype.setActiveWaveFormOsc1 = function(elem){

	for (var i=0;i<this.triangleTypeElemOsc1.children.length;i++){
		this.triangleTypeElemOsc1.children[i].classList.remove('active');
	}
	if (!elem.classList.contains('active')){
		elem.classList.add('active');
	}
	this.customOscPair1.wavetype(elem.getAttribute('data_wave_type'), 1);
	this.customOscPair2.wavetype(elem.getAttribute('data_wave_type'), 1);
	this.customOscPair3.wavetype(elem.getAttribute('data_wave_type'), 1);
}
Synthesizer.prototype.setActiveWaveFormOsc2 = function(elem){

	for (var i=0;i<this.triangleTypeElemOsc2.children.length;i++){
		this.triangleTypeElemOsc2.children[i].classList.remove('active');
	}
	if (!elem.classList.contains('active')){
		elem.classList.add('active');
	}
	this.customOscPair1.wavetype(elem.getAttribute('data_wave_type'), 2);
	this.customOscPair2.wavetype(elem.getAttribute('data_wave_type'), 2);
	this.customOscPair3.wavetype(elem.getAttribute('data_wave_type'), 2);
}











