import os
import yaml

services = [
    "users-service",
    "ticket-service",
    "booking-service",
    "payment-service",
    "events-service",
    "notification-service",
    "ai-service",
    "admin-service",
]

def parse_env(filepath):
    configmap_data = {}
    secret_data = {}
    
    if not os.path.exists(filepath):
        return configmap_data, secret_data

    with open(filepath, 'r') as f:
        lines = f.readlines()
        
    current_mode = "CONFIGMAP" # default
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        if line.startswith("# [CONFIGMAP]"):
            current_mode = "CONFIGMAP"
            continue
        elif line.startswith("# [SECRET]"):
            current_mode = "SECRET"
            continue
        elif line.startswith("#"):
            continue
            
        if "=" in line:
            key, val = line.split("=", 1)
            key = key.strip()
            val = val.strip()
            if current_mode == "SECRET":
                secret_data[key] = val
            else:
                configmap_data[key] = val
                
    return configmap_data, secret_data

def write_yaml(filepath, data):
    with open(filepath, 'w') as f:
        yaml.dump(data, f, sort_keys=False, Dumper=yaml.SafeDumper)
        
def generate_manifests():
    for service in services:
        k8s_dir = os.path.join(service, "k8s")
        os.makedirs(k8s_dir, exist_ok=True)
        
        env_path = os.path.join(service, ".env")
        cmap_data, sec_data = parse_env(env_path)
        
        # 1. ConfigMap
        if cmap_data:
            cm = {
                "apiVersion": "v1",
                "kind": "ConfigMap",
                "metadata": {"name": f"{service}-configmap"},
                "data": cmap_data
            }
            write_yaml(os.path.join(k8s_dir, f"{service}-configmap.yaml"), cm)
            
        # 2. Secret (using stringData as requested)
        if sec_data:
            sec = {
                "apiVersion": "v1",
                "kind": "Secret",
                "metadata": {"name": f"{service}-secret"},
                "type": "Opaque",
                "stringData": sec_data
            }
            write_yaml(os.path.join(k8s_dir, f"{service}-secret.yaml"), sec)
            
        # 3. Service
        port = int(cmap_data.get("PORT", "80")) if "PORT" in cmap_data else 80
        if service == "users-service": port = 8001
        elif service == "events-service": port = 8002
        elif service == "booking-service": port = 8003
        elif service == "payment-service": port = 8004
        elif service == "ticket-service": port = 8005
        elif service == "notification-service": port = 8006
        elif service == "ai-service": port = 8007
        elif service == "admin-service": port = 8008

        svc = {
            "apiVersion": "v1",
            "kind": "Service",
            "metadata": {"name": service},
            "spec": {
                "selector": {"app": service},
                "ports": [{"protocol": "TCP", "port": port, "targetPort": port}]
            }
        }
        write_yaml(os.path.join(k8s_dir, f"{service}-service.yaml"), svc)
        
        # 4. Deployment
        env_from = []
        if cmap_data:
            env_from.append({"configMapRef": {"name": f"{service}-configmap"}})
        if sec_data:
            env_from.append({"secretRef": {"name": f"{service}-secret"}})
            
        deploy = {
            "apiVersion": "apps/v1",
            "kind": "Deployment",
            "metadata": {"name": service},
            "spec": {
                "replicas": 1,
                "selector": {"matchLabels": {"app": service}},
                "template": {
                    "metadata": {"labels": {"app": service}},
                    "spec": {
                        "containers": [
                            {
                                "name": service,
                                "image": f"yourdockerhub/{service}:latest",
                                "ports": [{"containerPort": port}],
                                "envFrom": env_from
                            }
                        ]
                    }
                }
            }
        }
        write_yaml(os.path.join(k8s_dir, f"{service}-deployment.yaml"), deploy)
        print(f"Generated K8s manifests for {service} in {k8s_dir}")

if __name__ == "__main__":
    generate_manifests()
