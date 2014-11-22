package de.openkonsole.ui;

import java.net.InetAddress;

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
import de.openkonsole.net.UDPBroadcastSender;
import de.openkonsole.ui.ConsoleSearchProxy.ConsoleInfo;
import android.app.Activity;
import android.content.Intent;
import android.net.wifi.WifiManager;
import android.os.Bundle;
import android.text.format.Formatter;
import android.view.View;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;


@EActivity(R.layout.activity_main)
public class MainActivity extends Activity {

	private static final String FOUND_CONSOLE_PREFIX = "openKonsole @ ";
	
//	private UDPBroadcastReceiver udpReceiver = new UDPBroadcastReceiver(CONST.UDP_PORT);
//	private UDPBroadcastSender udpSender = new UDPBroadcastSender(CONST.UDP_PORT);
	private ConsoleSearchProxy searchProxy = new ConsoleSearchProxy(CONST.UDP_PORT);
	
	private int clientIpAddress;
	private Ip consoleAddress; 
	
	@ViewById TextView tvMessage;
	@ViewById TextView tvFoundConsole;

	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		WifiManager wm = (WifiManager) getSystemService(WIFI_SERVICE);
		clientIpAddress = wm.getConnectionInfo().getIpAddress();
		listenForConsole();
	}
	
	@AfterViews
	protected void afterViews() {
		tvFoundConsole.setAlpha(0f);
		tvFoundConsole.setScaleY(0f);
	}
	
	@Background
	protected void listenForConsole() {
		//final Ip ip = udpReceiver.listenForHost();
		//showFoundConsole(ip);
//		String bla = udpSender.fetchConsoleHostInfo(clientIpAddress);
//		System.out.println("--------> " + bla);
		final ConsoleInfo consoleInfo = searchProxy.findConsole(clientIpAddress);
		onConsoleFound(consoleInfo);
	}
	
	@UiThread void onConsoleFound(final ConsoleInfo info) {
		consoleAddress = new Ip(info.host, CONST.PORT);
		System.out.println("----> consoleAddress " + consoleAddress.getIp() + ":" + consoleAddress.getPort());
		
		showFoundConsole(consoleAddress);
	}

	
	@UiThread
	protected void showFoundConsole(final Ip addr) {
		
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
