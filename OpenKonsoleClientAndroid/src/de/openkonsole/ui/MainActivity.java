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
import android.widget.LinearLayout;
import android.widget.TextView;


@EActivity(R.layout.activity_main)
public class MainActivity extends Activity {
	
	private static final String FOUND_CONSOLE_PREFIX = "openKonsole @ ";
	
	private UDPBroadcastReceiver udpReceiver = new UDPBroadcastReceiver(CONST.UDP_PORT);
	
	private Ip consoleAddress; 
	
	@ViewById TextView tvMessage;
	@ViewById TextView tvFoundConsole;

	@Override
	protected void onCreate(Bundle savedInstanceState) {
		// TODO Auto-generated method stub
		super.onCreate(savedInstanceState);
		
		listenForConsole();
	}
	
	@AfterViews
	protected void afterViews() {
		tvFoundConsole.setAlpha(0f);
		tvFoundConsole.setScaleY(0f);
	}
	
	@Background
	protected void listenForConsole() {
		final Ip ip = udpReceiver.listenForHost();
		showFoundConsole(ip);
	}
	
	@UiThread
	protected void showFoundConsole(final Ip addr) {
		
		consoleAddress = addr;
		
		tvMessage.setText(R.string.msg_console_found);
		tvFoundConsole.setText(FOUND_CONSOLE_PREFIX + addr.toString());
		
		tvFoundConsole.animate().alpha(1.0f).scaleY(1.0f);
	}
	
	@Click(R.id.tv_found_console)
	protected void onLaunchButtonClick() {
		launchGamePadActivity();
	}
	
	
	private void launchGamePadActivity() {
		final Intent intent = new Intent(MainActivity.this, GamePadActivity_.class);
		intent.putExtra(GamePadActivity.INTENT_KEY_HOST_ADDRESS, consoleAddress);
		startActivity(intent);
	}
	
	
}
