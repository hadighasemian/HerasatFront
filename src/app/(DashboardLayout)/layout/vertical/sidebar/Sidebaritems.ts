import i18n from "@/utils/i18n";

export interface ChildItem {
  id?: number | string;
  name?: string;
  icon?: any;
  children?: ChildItem[];
  item?: any;
  url?: any;
  color?: string;
}

export interface MenuItem {
  heading?: string;
  name?: string;
  icon?: any;
  id?: number;
  to?: string;
  items?: MenuItem[];
  children?: ChildItem[];
  url?: any;
}

import { uniqueId } from "lodash";

const SidebarContent: MenuItem[] = [
  {
    id: 1,
    name: "Dashboard",
    items: [
      {
        heading:"Dashboards",
        children: [
          {
            name: "Users",
            icon: "solar:user-id-line-duotone",
            id: uniqueId(),
            url: "/Users",
          },

        ],
      },
    ],
  },
  {
    id: 2,
    name: "Storage",
    items: [
      {
        heading: "Storage",
        children: [
          //   {
          //   name: "Files",
          //   icon: "solar:cloud-file-line-duotone",
          //   id: uniqueId(),
          //   url: "/Storage/Files",
          // },
            {
                name: "Vectors",
                icon: "solar:cloud-storage-line-duotone",
                id: uniqueId(),
                url: "/Storage/Vector",
            },



        ],
      },
    ],
  },


];

export default SidebarContent;
