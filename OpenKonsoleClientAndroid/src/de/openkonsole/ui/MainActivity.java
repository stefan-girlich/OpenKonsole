package de.openkonsole.ui;

import java.io.IOException;
import java.net.UnknownHostException;

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
import de.openkonsole.R;
import de.openkonsole.Util;
import de.openkonsole.net.TCPClient;
import de.openkonsole.net.TCPClient.Callback;

@EActivity(R.layout.activity_main)
public class MainActivity extends Activity {

	TCPClient client;

	@ViewById
	RelativeLayout layoutMain;

	@Override
	protected void onCreate(Bundle savedInstanceState) {
		connectToServer();
		super.onCreate(savedInstanceState);
	}

	@Override
	protected void onDestroy() {
		if (client != null) {
			client.close();
		}
		super.onDestroy();
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

	private void sendButtonEvent(byte buttonIdentifikator, int action) {
		byte[] message = new byte[] { buttonIdentifikator, 0 };

		switch (action) {
		case MotionEvent.ACTION_DOWN:
			message[1] = CONST.BUTTON_DOWN;
			System.out.println("Button " + buttonIdentifikator + " pressed");
			break;
		case MotionEvent.ACTION_UP:
			message[1] = CONST.BUTTON_UP;
			System.out.println("Button " + buttonIdentifikator + " released");
			break;
		default:
			return;
		}

		client.sendRequest(Util.buildByteArray(message));
	}

	@Touch(R.id.btn_action_a)
	protected boolean onButtonATouch(View v, MotionEvent event) {
		sendButtonEvent(CONST.BUTTON_A, event.getAction());
		return true;
	}

	@Touch(R.id.btn_action_b)
	protected boolean onButtonBTouch(View v, MotionEvent event) {
		sendButtonEvent(CONST.BUTTON_B, event.getAction());
		return true;
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
}
