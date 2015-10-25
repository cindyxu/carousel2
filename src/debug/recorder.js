gm.Debug.Recorder = function() {

	var a;
	$(function() {
		a = document.createElement("a");
		document.body.appendChild(a);
		a.style = "display: none";
	});

	var saveData = function (url, fileName) {
		a.href = url;
		a.download = fileName;
		a.click();
		window.URL.revokeObjectURL(url);
	};

	var Recorder = function(canvas) {
		this._ccapture = new CCapture({
			format: 'gif',
			workersPath: '/',
			framerate: 60,
		});
		this._canvas = canvas;
	};

	Recorder.prototype.startRecording = function() {
		this._ccapture.start();
	};

	Recorder.prototype.capture = function() {
		this._ccapture.capture(this._canvas);
	};

	Recorder.prototype.stopRecording = function() {
		this._ccapture.stop();
		this._ccapture.save(function(url) {
			saveData(url, "recording.gif");
		});
	};

	return Recorder;

}();