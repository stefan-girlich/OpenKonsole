package de.openkonsole.ui;

import java.io.IOException;
import java.net.UnknownHostException;

import org.androidannotations.annotations.Background;
import org.androidannotations.annotations.Click;
import org.androidannotations.annotations.EActivity;
import org.androidannotations.annotations.UiThread;
import org.androidannotations.annotations.ViewById;

import android.app.Activity;
import android.graphics.Color;
import android.os.Bundle;
import android.widget.RelativeLayout;
import de.openkonsole.R;
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

	@Click(R.id.btn_action_a)
	protected void onButtonAClick() {
		client.sendRequest("A pressed");
		System.out.println("===> button A clicked!!!");
	}

	@Click(R.id.btn_action_b)
	protected void onButtonBClick() {
		client.sendRequest("B pressed");
		System.out.println("===> button B clicked!!!");
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
