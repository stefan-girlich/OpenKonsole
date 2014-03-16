package de.openkonsole.ui;

import java.io.IOException;
import java.net.UnknownHostException;

import org.androidannotations.annotations.AfterViews;
import org.androidannotations.annotations.Background;
import org.androidannotations.annotations.EActivity;
import org.androidannotations.annotations.Touch;
import org.androidannotations.annotations.UiThread;
import org.androidannotations.annotations.ViewById;

import android.app.Activity;
import android.graphics.Color;
import android.os.Bundle;
import android.view.MotionEvent;
import android.view.View;
import android.widget.RelativeLayout;
import de.openkonsole.CONST;
import de.openkonsole.CONST.ButtonAction;
import de.openkonsole.R;
import de.openkonsole.Util;
import de.openkonsole.CONST.Control;
import de.openkonsole.net.TCPClient;
import de.openkonsole.net.TCPClient.Callback;

@EActivity(R.layout.activity_main)
public class MainActivity extends Activity implements AnalogStick.Callback {

	TCPClient client;

	@ViewById RelativeLayout layoutMain;
	@ViewById AnalogStick vAnalogStick;

	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		
		connectToServer();
	}

	@Override
	protected void onDestroy() {
		if (client != null) {
			client.close();
		}
		super.onDestroy();
	}
	
	@AfterViews
	protected void afterViews() {
		vAnalogStick.setCallback(this);
	}

	@Background
	protected void connectToServer() {
		try {
			client = new TCPClient();
			client.addCallback(new Callback() {

				@Override
				public void onDataReceived(String data) {
					updateUI(Integer.parseInt(data));
				}
			});
		} catch (UnknownHostException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	@Touch(R.id.btn_action_a)
	protected boolean onButtonATouch(View v, MotionEvent event) {
		sendButtonEvent(CONST.Control.BUTTON_A, event.getAction());
		return true;
	}

	@Touch(R.id.btn_action_b)
	protected boolean onButtonBTouch(View v, MotionEvent event) {
		sendButtonEvent(CONST.Control.BUTTON_B, event.getAction());
		return true;
	}

	@Override
	public void onStickPositionChanged(final float posX, final float posY) {
		System.out.println("analog stick position changed: " + posX + " " + posY);
		sendAnalogInputEvent(posX, posY);
	}

	@Override
	public void onBackPressed() {
		super.onBackPressed();
		finish();
	}

	@UiThread
	protected void updateUI(final int playerID) {
		if (playerID == 0) {
			layoutMain.setBackgroundColor(Color.BLUE);
		} else if (playerID == 1) {
			layoutMain.setBackgroundColor(Color.RED);
		} else {
			throw new IllegalArgumentException("No setting found for playerID "
					+ playerID);
		}
	}

	private void sendButtonEvent(final Control element, final int motionEvtAction) {
		byte[] message = new byte[] { element.getIdentifier(), 0 };
	
		switch (motionEvtAction) {
		case MotionEvent.ACTION_DOWN:
			message[1] = CONST.ButtonAction.BUTTON_DOWN.getIdentifier();
			break;
		case MotionEvent.ACTION_UP:
			message[1] = CONST.ButtonAction.BUTTON_UP.getIdentifier();
			break;
		default:
			return;
		}
	
		client.sendRequest(Util.buildByteArray(message));
	}
	
	private void sendAnalogInputEvent(final float posX, final float posY) {
		byte[] msg = new byte[] {CONST.Control.ANALOG_INPUT.getIdentifier(), 
				Util.convertAnalogValueToByte(posX),
				Util.convertAnalogValueToByte(posY)
				};
		
		client.sendRequest(Util.buildByteArray(msg));
	}
}
