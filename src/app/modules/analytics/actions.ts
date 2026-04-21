"use client";

import { db } from "@/lib/firebase";
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  limit,
  collectionGroup,
  where
} from "firebase/firestore";

export interface DashboardStats {
  market: {
    totalRevenue: number;
    listingCount: number;
    orderCount: number;
    averageOrderValue: number;
  };
  qloud: {
    totalGroups: number;
    totalMediaCount: number;
    totalMembers: number;
  };
  recentActivity: any[];
}

export async function getAnalyticsDataAction(): Promise<DashboardStats> {
  try {
    // 1. MARKET STATS
    const listingsSnap = await getDocs(collection(db, "market_listings"));
    const ordersSnap = await getDocs(collection(db, "market_orders"));
    
    let totalRevenue = 0;
    const orders = ordersSnap.docs.map(d => {
      const data = d.data();
      totalRevenue += data.totalPrice || 0;
      return { 
        id: d.id, 
        type: 'ORDER',
        title: `Bestellung #${d.id.slice(0,5).toUpperCase()}`,
        userName: data.buyerName,
        amount: data.totalPrice,
        time: data.createdAt?.toMillis() || Date.now()
      };
    });

    // 2. QLOUD STATS
    const groupsSnap = await getDocs(collection(db, "groups"));
    // For media, use collectionGroup to get all media docs across all groups
    const mediaSnap = await getDocs(collectionGroup(db, "media"));
    
    let totalMembers = 0;
    const groups = groupsSnap.docs.map(d => {
      const data = d.data();
      totalMembers += (data.memberIds?.length || 0);
      return {
        id: d.id,
        type: 'NODE',
        title: `Neuer Node: ${data.name}`,
        userName: "System",
        time: data.createdAt?.toMillis() || Date.now()
      };
    });

    // 3. AGGREGATE RECENT ACTIVITY
    const allActivity = [...orders, ...groups]
      .sort((a, b) => b.time - a.time)
      .slice(0, 10);

    return {
      market: {
        totalRevenue,
        listingCount: listingsSnap.size,
        orderCount: ordersSnap.size,
        averageOrderValue: ordersSnap.size > 0 ? totalRevenue / ordersSnap.size : 0
      },
      qloud: {
        totalGroups: groupsSnap.size,
        totalMediaCount: mediaSnap.size,
        totalMembers
      },
      recentActivity: allActivity
    };
  } catch (err) {
    console.error("Failed to fetch analytics data:", err);
    return {
      market: { totalRevenue: 0, listingCount: 0, orderCount: 0, averageOrderValue: 0 },
      qloud: { totalGroups: 0, totalMediaCount: 0, totalMembers: 0 },
      recentActivity: []
    };
  }
}
