gm.Math = {

	bboxesOverlap: function(bbox, obbox, inclusive) {
		if (inclusive) return (bbox.x0 <= obbox.x1 && bbox.x1 >= obbox.x0 && 
		bbox.y0 <= obbox.y1 && bbox.y1 >= obbox.y0);
		else return (bbox.x0 < obbox.x1 && bbox.x1 > obbox.x0 && 
		bbox.y0 < obbox.y1 && bbox.y1 > obbox.y0);
	}

};