package de.openkonsole;

import org.androidannotations.annotations.Click;
import org.androidannotations.annotations.EActivity;

import android.app.Activity;


@EActivity(R.layout.activity_main)
public class MainActivity extends Activity {
	
	@Click(R.id.btn_action_a)
	protected void onButtonAClick() {
		System.out.println("===> button A clicked!!!");
	}
	
	@Click(R.id.btn_action_b)
	protected void onButtonBClick() {
		System.out.println("===> button B clicked!!!");
	}


}
