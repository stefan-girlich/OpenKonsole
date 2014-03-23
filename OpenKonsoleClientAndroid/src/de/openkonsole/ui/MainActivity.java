package de.openkonsole.ui;

import org.androidannotations.annotations.AfterViews;
import org.androidannotations.annotations.Background;
import org.androidannotations.annotations.Click;
import org.androidannotations.annotations.EActivity;
import org.androidannotations.annotations.UiThread;
import org.androidannotations.annotations.ViewById;

import de.openkonsole.CONST;
import de.openkonsole.R;
import de.openkonsole.net.Ip;
import de.openkonsole.net.UDPBroadcastReceiver;
import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;


@EActivity(R.layout.activity_main)
public class MainActivity extends Activity {
	
	private UDPBroadcastReceiver udpReceiver = new UDPBroadcastReceiver(CONST.UDP_PORT);
	
	private Ip consoleAddress; 
	
	
	@ViewById TextView tvMessage;
	@ViewById Button btnConnect;

	@Override
	protected void onCreate(Bundle savedInstanceState) {
		// TODO Auto-generated method stub
		super.onCreate(savedInstanceState);
		
		listenForConsole();
	}
	
	@AfterViews
	protected void afterViews() {
		
	}
	
	@Background
	protected void listenForConsole() {
		final Ip ip = udpReceiver.listenForHost();
		updateConsoleAddress(ip);
	}
	
	@UiThread
	protected void updateConsoleAddress(final Ip addr) {
		
		consoleAddress = addr;
		
		tvMessage.setText(R.string.msg_console_found);
		tvMessage.setText(tvMessage.getText() + addr.toString());
		btnConnect.setVisibility(View.VISIBLE);
	}
	
	@Click(R.id.btn_connect)
	protected void onLaunchButtonClick() {
		launchGamePadActivity();
	}
	
	
	private void launchGamePadActivity() {
		final Intent intent = new Intent(MainActivity.this, GamePadActivity_.class);
		intent.putExtra(GamePadActivity.INTENT_KEY_HOST_ADDRESS, consoleAddress);
		startActivity(intent);
	}
}
