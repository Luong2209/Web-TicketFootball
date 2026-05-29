namespace BaseCore.Entities
{
    public class TicketOrderItem
    {
        public int Id { get; set; }
        public int TicketOrderId { get; set; }
        public int TicketListingId { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }

        public TicketOrder TicketOrder { get; set; }
        public TicketListing TicketListing { get; set; }
        public List<ETicket> ETickets { get; set; } = new();
        public List<TicketOrderSeat> TicketOrderSeats { get; set; } = new();
    }
}
