package de.openkonsole.ui;

import org.androidannotations.annotations.Click;
import org.androidannotations.annotations.EView;
import org.androidannotations.annotations.Touch;

import de.openkonsole.R;
import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.util.AttributeSet;
import android.view.MotionEvent;
import android.view.View;

@EView
public class AnalogStick extends View {
	
	public final Paint DEFAULT_PAINT_BG = new Paint(Paint.ANTI_ALIAS_FLAG) {{
		setStyle(Paint.Style.FILL);
		setColor(Color.GRAY);
	}};
	
	public final Paint DEFAULT_PAINT_STICK = new Paint(Paint.ANTI_ALIAS_FLAG) {{
		setStyle(Paint.Style.FILL);
		setColor(Color.LTGRAY);
	}};
	
	public final float STICK_SIZE = 0.5f;	// relative to boundary radius
	
	
	private int boundaryRad, stickRad;
	private int currX, currY;
	
	private Callback callback;

	public AnalogStick(final Context context) {
		super(context);
	}
	
	public AnalogStick(final Context context, final AttributeSet attrs) {
		super(context, attrs);
		
	}
	
	public AnalogStick(Context context, AttributeSet attrs, int defStyleAttr) {
		super(context, attrs, defStyleAttr);
	}

	
	@Override
	protected void onSizeChanged(int w, int h, int oldw, int oldh) {
		super.onSizeChanged(w, h, oldw, oldh);
		
		if(w == 0 || h == 0) return;
		
		boundaryRad  = (int) (((float) w) / 2.0f);
		stickRad = (int) (STICK_SIZE * ((float) boundaryRad));
		
		// center stick
		currX = boundaryRad;
		currY = boundaryRad;
	}
	
	@Override
	protected void onDraw(final Canvas canvas) {
		
		if(boundaryRad == 0) return;
		canvas.drawCircle(boundaryRad, boundaryRad, boundaryRad, DEFAULT_PAINT_BG);
		canvas.drawCircle(currX, currY, stickRad, DEFAULT_PAINT_STICK);
		super.onDraw(canvas);
	}
	
	@Touch(R.id.v_analog_stick)
	protected boolean onTouch(final MotionEvent evt) {
		
		final int lastX = currX;
		final int lastY = currY;
		
		if(evt.getAction() != MotionEvent.ACTION_UP) {
			currX = (int) evt.getX();
			currY = (int) evt.getY();
		}else {
			currX = boundaryRad;
			currY = boundaryRad;
		}
		
		int normX = currX - boundaryRad;
		int normY = currY - boundaryRad;
		int dist = (int) (Math.sqrt((normX * normX) + (normY * normY)));
		
		if (dist > boundaryRad - stickRad) {
			
			final float scaleFac = ((float) (boundaryRad - stickRad)) / (float) dist;
			
			currX = (int) (( ((float) normX) * scaleFac) + boundaryRad);
			currY = (int) (( ((float) normY) * scaleFac) + boundaryRad);
		}
		
		if(currX != lastX || currY != lastY) {
			
			if(callback != null) {
				callback.onStickPositionChanged(
						(((float) (currX - boundaryRad)) / ((float) (boundaryRad - stickRad))) / 2.0f,
						(((float) (currY - boundaryRad)) / ((float) (boundaryRad - stickRad))) / -2.0f
				);
			}
		}
		
		
		invalidate();
		return true;
	}
	
	public void setCallback(final Callback cb) {
		callback = cb;
	}
	
	public interface Callback {
		void onStickPositionChanged(final float posX, final float posY);
	}
}
