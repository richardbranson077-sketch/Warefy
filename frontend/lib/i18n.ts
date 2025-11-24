// i18n configuration for internationalization
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation resources
const resources = {
    en: {
        translation: {
            // Common
            "common.save": "Save",
            "common.cancel": "Cancel",
            "common.delete": "Delete",
            "common.edit": "Edit",
            "common.create": "Create",
            "common.search": "Search",
            "common.filter": "Filter",
            "common.export": "Export",
            "common.loading": "Loading...",
            "common.error": "Error",
            "common.success": "Success",

            // Navigation
            "nav.dashboard": "Dashboard",
            "nav.inventory": "Inventory",
            "nav.orders": "Orders",
            "nav.shipping": "Shipping",
            "nav.warehouses": "Warehouses",
            "nav.reports": "Reports",
            "nav.settings": "Settings",

            // Inventory
            "inventory.title": "Inventory Management",
            "inventory.add_item": "Add Item",
            "inventory.sku": "SKU",
            "inventory.name": "Product Name",
            "inventory.quantity": "Quantity",
            "inventory.low_stock": "Low Stock",
            "inventory.reorder_point": "Reorder Point",

            // Orders
            "orders.title": "Order Management",
            "orders.create_order": "Create Order",
            "orders.order_id": "Order ID",
            "orders.status": "Status",
            "orders.customer": "Customer",
            "orders.total": "Total",

            // Messages
            "messages.item_created": "Item created successfully",
            "messages.item_updated": "Item updated successfully",
            "messages.item_deleted": "Item deleted successfully",
            "messages.confirm_delete": "Are you sure you want to delete this item?",
        }
    },
    es: {
        translation: {
            // Common
            "common.save": "Guardar",
            "common.cancel": "Cancelar",
            "common.delete": "Eliminar",
            "common.edit": "Editar",
            "common.create": "Crear",
            "common.search": "Buscar",
            "common.filter": "Filtrar",
            "common.export": "Exportar",
            "common.loading": "Cargando...",
            "common.error": "Error",
            "common.success": "Éxito",

            // Navigation
            "nav.dashboard": "Panel",
            "nav.inventory": "Inventario",
            "nav.orders": "Pedidos",
            "nav.shipping": "Envío",
            "nav.warehouses": "Almacenes",
            "nav.reports": "Informes",
            "nav.settings": "Configuración",

            // Inventory
            "inventory.title": "Gestión de Inventario",
            "inventory.add_item": "Agregar Artículo",
            "inventory.sku": "SKU",
            "inventory.name": "Nombre del Producto",
            "inventory.quantity": "Cantidad",
            "inventory.low_stock": "Stock Bajo",
            "inventory.reorder_point": "Punto de Reorden",

            // Orders
            "orders.title": "Gestión de Pedidos",
            "orders.create_order": "Crear Pedido",
            "orders.order_id": "ID de Pedido",
            "orders.status": "Estado",
            "orders.customer": "Cliente",
            "orders.total": "Total",

            // Messages
            "messages.item_created": "Artículo creado exitosamente",
            "messages.item_updated": "Artículo actualizado exitosamente",
            "messages.item_deleted": "Artículo eliminado exitosamente",
            "messages.confirm_delete": "¿Está seguro de que desea eliminar este artículo?",
        }
    },
    fr: {
        translation: {
            // Common
            "common.save": "Enregistrer",
            "common.cancel": "Annuler",
            "common.delete": "Supprimer",
            "common.edit": "Modifier",
            "common.create": "Créer",
            "common.search": "Rechercher",
            "common.filter": "Filtrer",
            "common.export": "Exporter",
            "common.loading": "Chargement...",
            "common.error": "Erreur",
            "common.success": "Succès",

            // Navigation
            "nav.dashboard": "Tableau de bord",
            "nav.inventory": "Inventaire",
            "nav.orders": "Commandes",
            "nav.shipping": "Expédition",
            "nav.warehouses": "Entrepôts",
            "nav.reports": "Rapports",
            "nav.settings": "Paramètres",

            // Inventory
            "inventory.title": "Gestion des Stocks",
            "inventory.add_item": "Ajouter un Article",
            "inventory.sku": "SKU",
            "inventory.name": "Nom du Produit",
            "inventory.quantity": "Quantité",
            "inventory.low_stock": "Stock Faible",
            "inventory.reorder_point": "Point de Réapprovisionnement",

            // Orders
            "orders.title": "Gestion des Commandes",
            "orders.create_order": "Créer une Commande",
            "orders.order_id": "ID de Commande",
            "orders.status": "Statut",
            "orders.customer": "Client",
            "orders.total": "Total",

            // Messages
            "messages.item_created": "Article créé avec succès",
            "messages.item_updated": "Article mis à jour avec succès",
            "messages.item_deleted": "Article supprimé avec succès",
            "messages.confirm_delete": "Êtes-vous sûr de vouloir supprimer cet article?",
        }
    }
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'en',
        debug: process.env.NODE_ENV === 'development',

        interpolation: {
            escapeValue: false, // React already escapes
        },

        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
        },
    });

export default i18n;
