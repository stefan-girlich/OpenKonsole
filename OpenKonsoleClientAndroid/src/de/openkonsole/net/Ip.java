package de.openkonsole.net;

import java.io.Serializable;

public class Ip implements Serializable {
	
	private static final long serialVersionUID = -7262249251419755357L;
	
	
	private final String ip;
	private final int port;

	public Ip(String ip, int port) {
		super();
		this.ip = ip;
		this.port = port;
	}

	public String getIp() {
		return ip;
	}

	public int getPort() {
		return port;
	}

	@Override
	public String toString() {
		return ip + ':' + port;
	}
}